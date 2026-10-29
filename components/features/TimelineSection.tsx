"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { formatDatePretty, isTaskOverdue, computeDueDate } from "@/lib/utils/date";
import { launchCelebrationConfetti } from "@/lib/motion/confetti";
import { Modal } from "@/components/ui/Modal";
import { TimelineTask, TaskPriority } from "@/types";

export function TimelineSection() {
  const { activeEvent, toggleTaskCompletion, updateActiveEvent, settings, addToast } = useUtsav();

  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPhase, setNewTaskPhase] = useState("1-2 Months Before");
  const [newTaskOffset, setNewTaskOffset] = useState<number>(30);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskCat, setNewTaskCat] = useState("General");

  const tasks = useMemo(() => activeEvent?.timeline || [], [activeEvent?.timeline]);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group tasks by phase
  const groupedTasks = useMemo(() => {
    const groups: Record<string, TimelineTask[]> = {};
    for (const t of tasks) {
      if (filter === "pending" && t.completed) continue;
      if (filter === "done" && !t.completed) continue;

      if (!groups[t.phase]) {
        groups[t.phase] = [];
      }
      groups[t.phase].push(t);
    }
    return groups;
  }, [tasks, filter]);

  if (!activeEvent) return null;

  const handleTaskToggle = (task: TimelineTask) => {
    toggleTaskCompletion(task.id);

    // If completing the task, check if the phase is now fully complete to shoot confetti!
    if (!task.completed) {
      const phaseTasks = tasks.filter((t) => t.phase === task.phase);
      const otherPending = phaseTasks.filter((t) => t.id !== task.id && !t.completed);

      if (otherPending.length === 0) {
        // Entire phase is now complete!
        launchCelebrationConfetti({ reduceMotion: settings.reduceMotion });
        addToast({
          type: "success",
          title: "Phase Complete!",
          message: `All milestones in "${task.phase}" are achieved! Shubh Shuruat!`,
        });
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      phase: newTaskPhase,
      dueOffsetDays: newTaskOffset,
      dueDate: computeDueDate(activeEvent.date, newTaskOffset),
      priority: newTaskPriority,
      completed: false,
      category: newTaskCat,
    };

    updateActiveEvent((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newTask],
    }));

    setNewTaskTitle("");
    setNewTaskDesc("");
    setIsAddModalOpen(false);

    addToast({
      type: "success",
      title: "Task Added",
      message: `"${newTask.title}" added to ${newTask.phase}.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((t) => t.id !== taskId),
    }));
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case "high":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "medium":
        return "bg-saffron-500/20 text-saffron-300 border-saffron-500/30";
      case "low":
        return "bg-plum-500/20 text-plum-300 border-plum-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
            Celebration Timeline
          </h1>
          <p className="text-xs text-ivory-300 mt-1">
            Phased milestones calculated backwards from {formatDatePretty(activeEvent.date)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Chips */}
          <div className="flex items-center p-1 rounded-xl bg-plum-900/60 border border-plum-700/50">
            {(["all", "pending", "done"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === f
                    ? "bg-saffron-500 text-plum-950 shadow-sm"
                    : "text-ivory-300 hover:text-ivory-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Add Task Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-plum-950 font-bold text-xs tracking-wide shadow-glass transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass">
        <div className="flex justify-between items-center text-xs text-ivory-300 mb-2">
          <span className="font-semibold text-ivory-100">Overall Milestone Progress</span>
          <span className="font-bold text-saffron-400">
            {completedCount} of {totalCount} completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-plum-950/80 h-2.5 rounded-full overflow-hidden border border-plum-800">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-saffron-500 via-rose-500 to-emerald-400 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Grouped Phase Accordions */}
      <div className="space-y-6">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="py-12 text-center text-xs text-ivory-400">
            No milestones matching filter &quot;{filter}&quot;.
          </div>
        ) : (
          Object.entries(groupedTasks).map(([phase, phaseTasks]) => {
            const phaseCompleted = phaseTasks.filter((t) => t.completed).length;
            const phaseTotal = phaseTasks.length;
            const isAllDone = phaseTotal > 0 && phaseCompleted === phaseTotal;

            return (
              <div
                key={phase}
                className="rounded-2xl border border-plum-700/50 bg-plum-900/30 backdrop-blur-md overflow-hidden shadow-glass"
              >
                {/* Phase Header */}
                <div className="flex items-center justify-between p-4 bg-plum-950/60 border-b border-plum-800/80">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 text-saffron-400" />
                    <h2 className="font-display text-base font-bold text-ivory-100">{phase}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isAllDone
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-plum-800/60 text-ivory-300 border-plum-700"
                      }`}
                    >
                      {phaseCompleted} / {phaseTotal} Done
                    </span>
                  </div>
                </div>

                {/* Phase Tasks List */}
                <div className="divide-y divide-plum-800/50 p-2">
                  <AnimatePresence>
                    {phaseTasks.map((task) => {
                      const overdue = !task.completed && isTaskOverdue(task.dueDate);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={settings.reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={settings.reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-start justify-between gap-3 p-3 rounded-xl transition-colors ${
                            task.completed ? "opacity-60 bg-plum-950/20" : "hover:bg-plum-800/30"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleTaskToggle(task)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-saffron-400 ${
                                task.completed
                                  ? "bg-emerald-500 text-plum-950"
                                  : "border border-plum-600 hover:border-saffron-400 text-transparent"
                              }`}
                              aria-label={
                                task.completed
                                  ? `Mark pending: ${task.title}`
                                  : `Mark completed: ${task.title}`
                              }
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            <div className="min-w-0">
                              <p
                                className={`text-sm font-semibold transition-all ${
                                  task.completed
                                    ? "line-through text-ivory-400"
                                    : "text-ivory-100"
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-ivory-300/80 mt-0.5 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPriorityBadge(
                                    task.priority,
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                                <span className="text-[11px] text-ivory-400 bg-plum-950/60 px-2 py-0.5 rounded border border-plum-800">
                                  {task.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span
                                className={`text-xs font-semibold block ${
                                  overdue ? "text-rose-400 font-bold" : "text-saffron-300"
                                }`}
                              >
                                {formatDatePretty(task.dueDate)}
                              </span>
                              {overdue && (
                                <span className="text-[10px] text-rose-400 flex items-center gap-1 justify-end mt-0.5">
                                  <AlertCircle className="w-3 h-3" /> Overdue
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-ivory-400/60 hover:text-rose-400 rounded-md hover:bg-white/5 transition-colors"
                              aria-label={`Delete task ${task.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Milestone Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Schedule Haldi Floral Vendor & Pick Garlands"
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Phase</label>
              <select
                value={newTaskPhase}
                onChange={(e) => setNewTaskPhase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              >
                <option value="6+ Months Before">6+ Months Before</option>
                <option value="3-5 Months Before">3-5 Months Before</option>
                <option value="1-2 Months Before">1-2 Months Before</option>
                <option value="2 Weeks Before">2 Weeks Before</option>
                <option value="Event Week">Event Week</option>
                <option value="D-Day & Post Event">D-Day & Post Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">
                Days Before Event
              </label>
              <input
                type="number"
                min="0"
                max="730"
                value={newTaskOffset}
                onChange={(e) => setNewTaskOffset(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Category</label>
              <input
                type="text"
                value={newTaskCat}
                onChange={(e) => setNewTaskCat(e.target.value)}
                placeholder="e.g. Decor, Catering, Attire"
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="Actionable instructions, key contacts, or delivery notes"
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-plum-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ivory-300 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-saffron-500 hover:bg-saffron-400 text-plum-950"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

