import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { adminUsers } from "@/lib/mongodb";
import { hashPassword, requireSuperAdmin } from "@/lib/auth";
import { adminUserSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ message: "Only a super-admin can edit users." }, { status: 403 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminUserSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the fields.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const col = await adminUsers();
  const _id = new ObjectId(id);
  const target = await col.findOne({ _id });

  if (!target) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const { name, password, role, isActive } = parsed.data;

  // Guard against locking everyone out: the last active super-admin cannot be
  // demoted or deactivated, including by themselves.
  const losesSuperAdmin =
    target.role === "SUPER_ADMIN" && (role === "ADMIN" || isActive === false);

  if (losesSuperAdmin) {
    const others = await col.countDocuments({
      role: "SUPER_ADMIN",
      isActive: true,
      _id: { $ne: _id },
    });
    if (others === 0) {
      return NextResponse.json(
        { message: "This is the only active super-admin. Promote someone else first." },
        { status: 409 },
      );
    }
  }

  await col.updateOne(
    { _id },
    {
      $set: {
        ...(name ? { name } : {}),
        ...(role ? { role } : {}),
        ...(isActive === undefined ? {} : { isActive }),
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
        updatedAt: new Date(),
      },
    },
  );

  const updated = await col.findOne({ _id });

  return NextResponse.json({
    user: {
      id,
      email: updated?.email,
      name: updated?.name,
      role: updated?.role,
      isActive: updated?.isActive,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ message: "Only a super-admin can remove users." }, { status: 403 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (id === session.id) {
    return NextResponse.json({ message: "You cannot delete your own account." }, { status: 409 });
  }

  const col = await adminUsers();
  const _id = new ObjectId(id);
  const target = await col.findOne({ _id });

  if (!target) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (target.role === "SUPER_ADMIN") {
    const others = await col.countDocuments({
      role: "SUPER_ADMIN",
      isActive: true,
      _id: { $ne: _id },
    });
    if (others === 0) {
      return NextResponse.json(
        { message: "This is the only active super-admin and cannot be removed." },
        { status: 409 },
      );
    }
  }

  await col.deleteOne({ _id });
  return NextResponse.json({ ok: true });
}
