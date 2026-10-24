"use client";

import React, { useState, useMemo } from "react";
import { Profile, AccountStatus } from "@/types/database";
import {
  SearchInput,
  Select,
  StatusBadge,
  Button,
  Pagination,
  ConfirmDialog,
  AlertMessage,
  EmptyState,
} from "@/components/ui";
import { updateUserStatus, deleteUser } from "@/app/admin/actions";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Check,
  X,
  UserX,
  RotateCcw,
  Trash2,
  Shield,
  Info,
  User,
  Phone,
  Building,
  Calendar,
  Clock,
} from "lucide-react";

export interface UsersManagementTableProps {
  initialUsers: Profile[];
  currentAdminId: string;
}

export function UsersManagementTable({
  initialUsers,
  currentAdminId,
}: UsersManagementTableProps) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Feedback states
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Dialog & Detail Modal states
  const [deleteDialogUser, setDeleteDialogUser] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inspectUser, setInspectUser] = useState<Profile | null>(null);

  // Filter & Search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || u.account_status === statusFilter;
      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Status mutation handler
  const handleStatusChange = async (userId: string, newStatus: AccountStatus) => {
    setActionError(null);
    setActionSuccess(null);
    setLoadingUserId(userId);

    try {
      const res = await updateUserStatus(userId, newStatus);
      if (!res.success) {
        setActionError(res.error || "Failed to update user status.");
        return;
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, account_status: newStatus, updated_at: new Date().toISOString() }
            : u
        )
      );

      const actionText =
        newStatus === "approved"
          ? "approved"
          : newStatus === "rejected"
          ? "rejected"
          : newStatus === "deactivated"
          ? "deactivated"
          : "updated";

      setActionSuccess(`User account status successfully ${actionText}.`);
    } catch (err: unknown) {
      console.error("Status change error:", err);
      setActionError("An unexpected server error occurred while updating status.");
    } finally {
      setLoadingUserId(null);
    }
  };

  // Delete user handler
  const handleConfirmDelete = async () => {
    if (!deleteDialogUser) return;
    setIsDeleting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await deleteUser(deleteDialogUser.id);
      if (!res.success) {
        setActionError(res.error || "Failed to delete user.");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteDialogUser.id));
      setActionSuccess(
        `User "${deleteDialogUser.full_name}" (${deleteDialogUser.email}) was permanently removed.`
      );
      setDeleteDialogUser(null);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      setActionError("An unexpected server error occurred while deleting the user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications / Alerts */}
      {actionSuccess && (
        <AlertMessage
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      )}
      {actionError && (
        <AlertMessage
          type="error"
          message={actionError}
          onClose={() => setActionError(null)}
        />
      )}

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, department..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "deactivated", label: "Deactivated" },
              ]}
            />
          </div>

          <div className="w-32">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Roles" },
                { value: "user", label: "Users" },
                { value: "admin", label: "Admins" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* User Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {paginatedUsers.length === 0 ? (
          <EmptyState
            title="No users match your criteria"
            description="Try modifying your search or clearing applied status and role filters."
            action={
              (search || statusFilter !== "all" || roleFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setRoleFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">User</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Registered</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((user) => {
                  const isSelf = user.id === currentAdminId;
                  const isPending = user.account_status === "pending";
                  const isApproved = user.account_status === "approved";
                  const isDeactivated = user.account_status === "deactivated";
                  const isUserLoading = loadingUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* User Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-200">
                            {user.full_name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 truncate">
                                {user.full_name}
                              </span>
                              {isSelf && (
                                <span className="inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <Shield className="w-3 h-3 text-blue-600" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              <User className="w-3 h-3 text-slate-400" />
                              User
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.account_status} size="sm" />
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4 text-xs text-slate-500" title={formatDate(user.created_at)}>
                        {formatRelativeTime(user.created_at)}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Info / Inspect Button */}
                          <button
                            type="button"
                            onClick={() => setInspectUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="View Full Profile Details"
                            aria-label={`View ${user.full_name} details`}
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {/* Pending: Approve & Reject */}
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-500 h-8 px-2.5 text-xs"
                                onClick={() => handleStatusChange(user.id, "approved")}
                                isLoading={isUserLoading}
                                title="Approve Registration"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 px-2.5 text-xs"
                                onClick={() => handleStatusChange(user.id, "rejected")}
                                isLoading={isUserLoading}
                                title="Reject Registration"
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {/* Approved: Deactivate (prevent self) */}
                          {isApproved && !isSelf && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-700 border-amber-300 hover:bg-amber-50 h-8 px-2.5 text-xs"
                              onClick={() => handleStatusChange(user.id, "deactivated")}
                              isLoading={isUserLoading}
                              title="Deactivate Account"
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Deactivate
                            </Button>
                          )}

                          {/* Deactivated: Reactivate */}
                          {isDeactivated && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-8 px-2.5 text-xs"
                              onClick={() => handleStatusChange(user.id, "approved")}
                              isLoading={isUserLoading}
                              title="Reactivate Account"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              Reactivate
                            </Button>
                          )}

                          {/* Delete Account (prevent self) */}
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => setDeleteDialogUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete User Permanently"
                              aria-label={`Delete ${user.full_name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      </div>

      {/* User Details Inspector Modal */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg uppercase">
                  {inspectUser.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {inspectUser.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">{inspectUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">System Role</span>
                <StatusBadge status={inspectUser.role} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Account Status</span>
                <StatusBadge status={inspectUser.account_status} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Phone Number</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {inspectUser.phone || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Department</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {inspectUser.department || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Registered At</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(inspectUser.created_at)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Last Profile Update</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(inspectUser.updated_at)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectUser(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Permanent User Deletion */}
      <ConfirmDialog
        isOpen={!!deleteDialogUser}
        title="Permanently Delete User Account"
        description={`Are you sure you want to delete "${deleteDialogUser?.full_name}" (${deleteDialogUser?.email})? This action will permanently remove their authentication identity, profile records, and associated support tickets.`}
        confirmText="Delete User Permanently"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setDeleteDialogUser(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
