"use client";
import { AiOutlineCheckCircle } from "react-icons/ai";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

const subscribeToAuth = (onStoreChange: () => void) =>
  pb.authStore.onChange(() => onStoreChange());
const getClientAuth = () => pb.authStore.isValid;
const getServerAuth = () => false;

const Dashboard = () => {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getClientAuth,
    getServerAuth,
  );
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const currentUserId = pb.authStore.record?.id ?? "";

        if (!currentUserId) {
          setLoadError("The authenticated user ID is missing.");
          return;
        }

        const result = await pb.collection("Tasks").getList(1, 1, {
          filter: `workerId = "${currentUserId}"`,
          requestKey: null,
        });

        setTaskCount(result.totalItems ?? result.items.length);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main>
      <div className="flex flex-col justify-start gap-3 mx-5 my-1">
        <h1 className="text-primary text-xl font-bold">Dashboard</h1>
        <span className="text-sm text-secondary">
          Admin: {pb.authStore.record?.email}
        </span>
      </div>
      <div className="flex flex-row gap-2 mx-7 my-2">
        <div className="flex flex-row gap-1 items-center">
          <AiOutlineCheckCircle className="text-green-600" />
          <span className="flex flex-col">
            <h3>{loading ? "Loading..." : loadError || taskCount}</h3>
          </span>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;