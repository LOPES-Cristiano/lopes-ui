import { Wrench } from "lucide-react";

export default function UIBuilderPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-[calc(100vh-4rem)] px-6 text-center">
      <Wrench className="size-10 text-zinc-400" />
      <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Em breve</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
        O UI Builder está em manutenção e voltará em breve.
      </p>
    </div>
  );
}
