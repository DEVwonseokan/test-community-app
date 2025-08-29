"use client";

export default function Error({ error }: { error: Error }) {
    return (
        <div className="p-8 text-red-600">
            에러가 발생했어요: {error.message}
        </div>
    );
}