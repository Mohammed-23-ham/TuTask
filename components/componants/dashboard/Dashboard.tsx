"use client";
import {
  FiCheckCircle,
  FiClock,
  FiChevronDown,
  FiList,
  FiLogOut,
  FiXCircle,
} from "react-icons/fi";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

type TaskStatus = "pending" | "cancelled" | "completed";

const taskStatuses: TaskStatus[] = ["pending", "cancelled", "completed"];

type TaskRecord = {
  id: string;
  firstName?: string;
  lastName?: string;
  status?: TaskStatus;
  created: string;
  taskContent?: string;
  email?: string;
  phone?: string;
};

// يشترك في تغييرات حالة المصادقة لإعادة تحديث المكوّن عند حدوثها.
const subscribeToAuth = (onStoreChange: () => void) =>
  pb.authStore.onChange(() => onStoreChange());

// يُرجع حالة صلاحية مصادقة المستخدم على جهة العميل.
const getClientAuth = () => pb.authStore.isValid;

// يُرجع حالة مصادقة ثابتة وآمنة أثناء العرض على الخادم.
const getServerAuth = () => false;

// يعرض لوحة التحكم ويحمّل عدد المهام الخاصة بالمستخدم المصادق عليه.
const Dashboard = () => {
  // يوفر أدوات التنقل بين صفحات التطبيق.
  const router = useRouter();

  // يراقب حالة مصادقة المستخدم لإظهار اللوحة أو إخفائها.
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getClientAuth,
    getServerAuth,
  );

  // يخزّن أعداد المهام حسب حالتها للمستخدم الحالي.
  const [taskCounts, setTaskCounts] = useState({
    all: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });

  // يخزّن مهام المستخدم لعرضها في الجدول.
  const [tasks, setTasks] = useState<TaskRecord[]>([]);

  // يحدد ما إذا كان تحميل المهام لا يزال قيد التنفيذ.
  const [loading, setLoading] = useState(true);

  // يخزّن رسالة الخطأ الناتجة عن فشل تحميل المهام.
  const [loadError, setLoadError] = useState("");

  // يخزّن رسالة الخطأ الناتجة عن فشل تحديث حالة مهمة.
  const [statusError, setStatusError] = useState("");

  // يحدد المهمة التي يجري تحديث حالتها لمنع التحديثات المتزامنة.
  const [updatingTaskId, setUpdatingTaskId] = useState("");

  // يحدد قائمة الحالة المفتوحة حاليًا.
  const [openStatusTaskId, setOpenStatusTaskId] = useState("");

  // يحدد المهمة التي تعرض نصها كاملًا حاليًا.
  const [expandedTaskId, setExpandedTaskId] = useState("");

  // يسجل خروج المستخدم ويفرغ بيانات جلسة المصادقة ثم ينقله إلى صفحة الدخول.
  const handleLogout = () => {
    pb.authStore.clear();
    router.replace("/login");
  };

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }

    // يجلب عدد المهام المرتبطة بالمستخدم الحالي من PocketBase.
    const fetchTasks = async () => {
      try {
        // يستخرج معرّف المستخدم المصادق عليه حاليًا.
        const currentUserId = pb.authStore.record?.id ?? "";

        if (!currentUserId) {
          setLoadError("The authenticated user ID is missing.");
          return;
        }

        // يجلب مهام المستخدم لحساب العدد الكلي وأعداد الحالات.
        const taskRecords = await pb.collection("Tasks").getFullList<TaskRecord>({
          filter: `workerId = "${currentUserId}"`,
          requestKey: null,
        });
        const sortedTaskRecords = [...taskRecords].sort(
          (firstTask, secondTask) =>
            new Date(secondTask.created).getTime() -
            new Date(firstTask.created).getTime(),
        );

        setTasks(sortedTaskRecords);
        setTaskCounts({
          all: sortedTaskRecords.length,
          completed: sortedTaskRecords.filter((task) => task.status === "completed").length,
          pending: sortedTaskRecords.filter((task) => task.status === "pending").length,
          cancelled: sortedTaskRecords.filter((task) => task.status === "cancelled").length,
        });
      } catch (error) {
        // يسجّل تفاصيل الخطأ لتسهيل تشخيص فشل تحميل المهام.
        console.error("Failed to fetch tasks", error);

        // يستخرج رمز حالة HTTP من الخطأ إن كان متاحًا.
        const status = (error as { status?: number }).status;
        setLoadError(
          status === 403
            ? "You do not have permission to read your tasks. Update the Tasks List rule in PocketBase."
            : "Failed to load tasks.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      setUpdatingTaskId(taskId);
      setStatusError("");
      const savedTask = await pb.collection("Tasks").update<TaskRecord>(
        taskId,
        { status },
        { requestKey: null },
      );
      setTasks((currentTasks) => {
        const updatedTasks = currentTasks.map((task) =>
          task.id === taskId ? savedTask : task,
        );

        setTaskCounts({
          all: updatedTasks.length,
          completed: updatedTasks.filter((task) => task.status === "completed").length,
          pending: updatedTasks.filter((task) => task.status === "pending").length,
          cancelled: updatedTasks.filter((task) => task.status === "cancelled").length,
        });
        return updatedTasks;
      });
    } catch (error) {
      console.error("Failed to update task status", error);
      const pocketBaseError = error as {
        status?: number;
        response?: { message?: string };
      };
      setStatusError(
        pocketBaseError.response?.message ||
          (pocketBaseError.status === 403
            ? "Update permission is missing. Set the Tasks Update rule in PocketBase."
            : "Failed to update task status."),
      );
    } finally {
      setUpdatingTaskId("");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main>
      <div className="flex flex-col justify-start gap-3 mx-5 my-1">
        <h1 className="text-primary text-xl font-bold">Dashboard</h1>
        <span className="flex flex-row text-sm text-secondary">
          <h2>Admin:</h2> {pb.authStore.record?.email}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mx-5 my-4 md:grid-cols-4">
        {[
          { label: "All Tasks", count: taskCounts.all, icon: FiList },
          { label: "Completed", count: taskCounts.completed, icon: FiCheckCircle },
          { label: "Pending", count: taskCounts.pending, icon: FiClock },
          { label: "Cancelled", count: taskCounts.cancelled, icon: FiXCircle },
        ].map(({ label, count, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-24 items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-card-foreground shadow-sm"
          >
            <Icon className="size-7 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex min-w-0 flex-col">
              <h3 className="text-xl font-bold text-secondary ">
                {loading ? "..." : count}
              </h3>
              <span className="truncate text-sm text-primary">{label}</span>
            </div>
          </div>
        ))}
      </div>
      {statusError && (
        <p className="mx-5 my-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {statusError}
        </p>
      )}
      <div className="mx-5 my-6 space-y-3 min-[875px]:hidden">
        {tasks.map((task) => {
          const taskText = task.taskContent ?? "";
          const visibleTask = taskText.slice(0, 20);
          const status = task.status ?? "pending";
          const statusOptions = [
            status,
            ...taskStatuses.filter((taskStatus) => taskStatus !== status),
          ];

          return (
            <article
              key={task.id}
              className="rounded-md border border-border bg-card p-4 shadow-sm"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <span className="block text-xs text-muted-foreground">First Name</span>
                  <span className="break-words text-card-foreground">{task.firstName || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Last Name</span>
                  <span className="break-words text-card-foreground">{task.lastName || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">State</span>
                  <div className="relative mt-1 w-fit">
                    <button
                      type="button"
                      disabled={updatingTaskId === task.id}
                      onClick={() =>
                        setOpenStatusTaskId((currentTaskId) =>
                          currentTaskId === task.id ? "" : task.id,
                        )
                      }
                      className={`flex min-w-28 items-center justify-between gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-100 text-green-700"
                          : status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {status}
                      <FiChevronDown
                        className={`transition-transform duration-300 ${
                          openStatusTaskId === task.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`mt-2 min-w-28 overflow-hidden rounded-md border bg-card shadow-md transition-all duration-300 ${
                        openStatusTaskId === task.id
                          ? "max-h-24 scale-100 border-border p-1 opacity-100"
                          : "pointer-events-none max-h-0 scale-95 border-transparent p-0 opacity-0"
                      }`}
                    >
                      {statusOptions.slice(1).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setOpenStatusTaskId("");
                            handleStatusChange(task.id, option);
                          }}
                          className="block w-full rounded px-3 py-2 text-left text-xs capitalize text-foreground transition-all duration-300 hover:bg-muted"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Date</span>
                  <span className="break-words text-card-foreground">
                    {new Date(task.created).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground">Task</span>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTaskId((currentTaskId) =>
                        currentTaskId === task.id ? "" : task.id,
                      )
                    }
                    className="w-full break-words text-left text-sm text-muted-foreground transition-all duration-300 hover:text-foreground"
                  >
                    {expandedTaskId === task.id
                      ? taskText || "-"
                      : `${visibleTask}${taskText.length > 20 ? "..." : ""}`}
                  </button>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="break-all text-card-foreground">{task.email || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground">Phone</span>
                  <span className="break-words text-card-foreground">{task.phone || "-"}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <section className="mx-5 my-6 hidden rounded-md border border-border bg-card shadow-sm min-[875px]:block">
        <div className="w-full">
          <table className="w-full table-fixed text-left text-sm text-card-foreground">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">First Name</th>
                <th className="px-4 py-3">Last Name</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => {
                const taskText = task.taskContent ?? "";
                const visibleTask = taskText.slice(0, 20);
                const status = task.status ?? "pending";
                const statusOptions = [
                  status,
                  ...taskStatuses.filter((taskStatus) => taskStatus !== status),
                ];

                return (
                  <tr key={task.id} className="hover:bg-muted/50">
                    <td className="break-words px-4 py-3">{task.firstName || "-"}</td>
                    <td className="break-words px-4 py-3">{task.lastName || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="relative w-fit">
                        <button
                          type="button"
                          disabled={updatingTaskId === task.id}
                          onClick={() =>
                            setOpenStatusTaskId((currentTaskId) =>
                              currentTaskId === task.id ? "" : task.id,
                            )
                          }
                          className={`flex min-w-28 items-center justify-between gap-2 rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize outline-none transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-ring ${
                            status === "completed"
                              ? "bg-green-100 text-green-700"
                              : status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                          aria-expanded={openStatusTaskId === task.id}
                          aria-haspopup="listbox"
                          aria-label={`Change status for ${task.firstName || "task"}`}
                        >
                          {status}
                          <FiChevronDown
                            className={`transition-transform duration-300 ${
                              openStatusTaskId === task.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`mt-2 min-w-28 origin-top overflow-hidden rounded-md border bg-card shadow-md transition-all duration-300 ${
                            openStatusTaskId === task.id
                              ? "max-h-24 scale-100 border-border p-1 opacity-100"
                              : "pointer-events-none max-h-0 scale-95 border-transparent p-0 opacity-0"
                          }`}
                          role="listbox"
                          aria-label="Task status options"
                        >
                          {statusOptions.slice(1).map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setOpenStatusTaskId("");
                                handleStatusChange(task.id, option);
                              }}
                              className="block w-full rounded px-3 py-2 text-left text-xs capitalize text-foreground transition-all duration-300 hover:bg-muted"
                              role="option"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="break-words px-4 py-3">
                      {new Date(task.created).toLocaleDateString("en-GB")}
                    </td>
                    <td className="break-words px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTaskId((currentTaskId) =>
                            currentTaskId === task.id ? "" : task.id,
                          )
                        }
                        className="w-full text-left text-muted-foreground transition-all duration-300 hover:text-foreground"
                        aria-expanded={expandedTaskId === task.id}
                        aria-label="Show full task"
                      >
                        {expandedTaskId === task.id
                          ? taskText || "-"
                          : `${visibleTask}${taskText.length > 20 ? "..." : ""}`}
                      </button>
                    </td>
                    <td className="break-all px-4 py-3">{task.email || "-"}</td>
                    <td className="break-words px-4 py-3">{task.phone || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="تسجيل الخروج"
        className="flex flex-row gap-4 transition-all duration-300 fixed top-[90%] left-[1%] text-white text-2xl bg-amber-700 h-10 w-10 text-center items-center align-center p-2 rounded-md hover:w-30 group"
      >
        <FiLogOut className="shrink-0 opacity-100" />
        <span className="opacity-0 text-[18px] transition-all duration-600 group-hover:opacity-100">
          logout
        </span>
      </button>
    </main>
  );
};

export default Dashboard;