"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    Pencil,
    Archive,
    ArchiveRestore,
    Trash2,
    Loader2,
    AlertTriangle,
    X,
} from "lucide-react";

type Action = "archive" | "restore" | "delete";

type Props = {
    productId: string;
    productName: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    canDelete: boolean;
};

export default function ProductActions({
    productId,
    productName,
    status,
    canDelete,
}: Props) {
    const router = useRouter();

    const dialogRef = useRef<HTMLDialogElement>(null);
    const requestLock = useRef(false);

    const [action, setAction] = useState<Action | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isArchived = status === "ARCHIVED";

    const actionConfig = {
        archive: {
            title: "Archivar producto",
            description:
                "El producto dejará de estar disponible en la tienda, pero conservará toda su información.",
            button: "Archivar producto",
        },
        restore: {
  title: "Recuperar y publicar producto",
  description:
    "El producto volverá a estar publicado y será visible nuevamente en la tienda.",
  button: "Recuperar y publicar",
},
        delete: {
            title: "Eliminar producto",
            description:
                "Esta acción es permanente. Si el producto tiene pedidos asociados, no podrá eliminarse.",
            button: "Eliminar definitivamente",
        },
    };

  function openConfirmation(nextAction: Action) {
    if (nextAction === "delete" && !canDelete) return;

    setError("");
    setAction(nextAction);
    dialogRef.current?.showModal();
}
    function closeConfirmation() {
        if (requestLock.current) return;

        dialogRef.current?.close();
        setAction(null);
        setError("");
    }

async function executeAction() {
    if (!action || requestLock.current) return;

    if (action === "delete" && !canDelete) {
        setError("No tienes permisos para eliminar productos.");
        return;
    }

    requestLock.current = true;
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `/api/admin/products/${encodeURIComponent(productId)}`,
                {
                    method: action === "delete" ? "DELETE" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    ...(action !== "delete"
                        ? {
                            body: JSON.stringify({ action }),
                        }
                        : {}),
                },
            );

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.ok) {
                throw new Error(
                    data?.message || "No fue posible realizar la operación.",
                );
            }

            dialogRef.current?.close();
            setAction(null);
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error inesperado.",
            );
        } finally {
            requestLock.current = false;
            setLoading(false);
        }
    }

    const buttonClass =
        "inline-flex size-9 items-center justify-center rounded-lg border border-[#E8E5DF] transition disabled:opacity-50";

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <Link
                    href={`/admin/productos/${productId}/editar`}
                    title="Editar producto"
                    aria-label="Editar producto"
                    className={`${buttonClass} text-neutral-700 hover:border-[#C3AA84] hover:bg-[#F7F6F3]`}
                >
                    <Pencil size={16} />
                </Link>

                {isArchived ? (
                    <button
                        type="button"
                        title="Recuperar producto"
                        aria-label="Recuperar producto"
                        disabled={loading}
                        onClick={() => openConfirmation("restore")}
                        className={`${buttonClass} text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50`}
                    >
                        <ArchiveRestore size={16} />
                    </button>
                ) : (
                    <button
                        type="button"
                        title="Archivar producto"
                        aria-label="Archivar producto"
                        disabled={loading}
                        onClick={() => openConfirmation("archive")}
                        className={`${buttonClass} text-amber-700 hover:border-amber-300 hover:bg-amber-50`}
                    >
                        <Archive size={16} />
                    </button>
                )}

               {canDelete && (
    <button
        type="button"
        title="Eliminar producto"
        aria-label="Eliminar producto"
        disabled={loading}
        onClick={() => openConfirmation("delete")}
        className={`${buttonClass} text-red-600 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed`}
    >
        <Trash2 size={16} />
    </button>
)}
            </div>

            <dialog
                ref={dialogRef}
                aria-labelledby={`action-title-${productId}`}
                onCancel={event => {
                    event.preventDefault();
                    closeConfirmation();
                }}
                className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#E8E5DF] bg-white p-6 text-left shadow-2xl backdrop:bg-black/60"
            >
                {action && (
                    <>
                        <div className="mb-5 flex items-start justify-between">
                            <div
                                className={[
                                    "flex size-12 items-center justify-center rounded-xl",
                                    action === "delete"
                                        ? "bg-red-100 text-red-600"
                                        : action === "archive"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-emerald-100 text-emerald-700",
                                ].join(" ")}
                            >
                                {action === "delete" ? (
                                    <AlertTriangle size={24} />
                                ) : action === "archive" ? (
                                    <Archive size={24} />
                                ) : (
                                    <ArchiveRestore size={24} />
                                )}
                            </div>

                            <button
                                type="button"
                                aria-label="Cerrar confirmación"
                                disabled={loading}
                                onClick={closeConfirmation}
                                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h2
                            id={`action-title-${productId}`}
                            className="text-xl font-bold text-[#101010]"
                        >
                            {actionConfig[action].title}
                        </h2>

                        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                            {action === "delete" && !isArchived
                                ? "Por seguridad, debes archivar este producto antes de poder eliminarlo definitivamente."
                                : actionConfig[action].description}
                        </p>

                        <div className="mt-4 rounded-lg border border-[#E8E5DF] bg-[#F7F6F3] p-4">
                            <p className="text-xs text-neutral-500">
                                Producto seleccionado
                            </p>

                            <p className="mt-1 font-semibold text-[#101010]">
                                {productName}
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={closeConfirmation}
                                className="rounded-lg border border-[#E8E5DF] px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-[#F7F6F3]"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                disabled={loading || (action === "delete" && !isArchived)}
                                onClick={executeAction}
                                className={[
                                    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
                                    action === "delete"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-[#101010] hover:bg-neutral-800",
                                ].join(" ")}
                            >
                                {loading && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}

                                {loading
                                    ? "Procesando..."
                                    : action === "delete" && !isArchived
                                        ? "Debes archivar primero"
                                        : actionConfig[action].button}
                            </button>
                        </div>
                    </>
                )}
            </dialog>
        </>
    );
}