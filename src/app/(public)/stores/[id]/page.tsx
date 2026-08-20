interface StorePageProps {
  params: Promise<{ id: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Store Profile</h1>
      <p className="text-slate-500">Viewing seller store ID: {id}</p>
    </div>
  );
}
