"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteQuiz } from "@/app/actions/admin";

export function DeleteQuizButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onClick() {
    if (!confirm(`هل تريد حذف «${title}»؟ لا يمكن التراجع.`)) return;
    setLoading(true);
    try {
      const res = await deleteQuiz(id);
      if (!res.ok) {
        toast.error(res.error || "تعذر الحذف");
        return;
      }
      toast.success("تم الحذف");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="danger" onClick={onClick} loading={loading}>
      <Trash2 className="h-4 w-4" />
      حذف
    </Button>
  );
}
