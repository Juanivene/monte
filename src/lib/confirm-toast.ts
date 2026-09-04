import { toast } from "sonner";

export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    function settle(value: boolean) {
      if (settled) return;
      settled = true;
      toast.dismiss(id);
      resolve(value);
    }

    const id = toast(message, {
      duration: Infinity,
      action: { label: "Confirmar", onClick: () => settle(true) },
      cancel: { label: "Cancelar", onClick: () => settle(false) },
      onDismiss: () => settle(false),
      onAutoClose: () => settle(false),
    });
  });
}
