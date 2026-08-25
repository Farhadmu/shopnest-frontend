import { getOrderById } from "@/lib/api/orders";
export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order: any = null;
  try {
    order = await getOrderById(id);
  } catch {}
  if (!order)
    return (
      <div className="rounded-2xl border border-error/30 bg-error/5 p-8">
        <h1 className="text-2xl font-black">Order not found</h1>
        <p className="mt-2 text-sm text-muted">
          This order may not exist or you may not have access.
        </p>
      </div>
    );
  const steps = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  const current = steps.indexOf(order.status);
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Order tracking</p>
        <h1 className="mt-1 text-3xl font-black">Order #{order.id.slice(-8)}</h1>
        <p className="mt-2 text-sm text-muted">
          Placed {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="grid gap-3 md:grid-cols-6">
          {steps.map((s, i) => (
            <div key={s} className="text-center">
              <div
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-black ${i <= current ? "bg-primary text-white" : "bg-muted-bg text-muted"}`}
              >
                {i + 1}
              </div>
              <p className="mt-2 text-[11px] font-bold capitalize">{s.replaceAll("_", " ")}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-black">Items</h2>
          <div className="mt-4 grid gap-3">
            {order.items.map((i: any, index: number) => (
              <div key={index} className="flex justify-between rounded-xl bg-muted-bg p-4">
                <div>
                  <p className="font-bold">{i.title || `Product ${i.productId}`}</p>
                  <p className="text-xs text-muted">Qty {i.quantity}</p>
                </div>
                <b>৳{(i.price * i.quantity).toLocaleString()}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-black">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <b>৳{order.subtotal}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Discount</span>
              <b>-৳{order.discount}</b>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <span>Total</span>
              <b>৳{order.totalAmount}</b>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-muted-bg p-3 text-xs text-muted">
            Delivery address: {order.shippingAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
