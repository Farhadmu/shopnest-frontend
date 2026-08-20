interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Product Details</h1>
      <p className="text-slate-500">Viewing product ID: {id}</p>
    </div>
  );
}
