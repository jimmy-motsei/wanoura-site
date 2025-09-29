// Verify signature and enqueue (stub)
export async function POST(req:Request){
  const events = await req.json()
  // TODO: verify X-HubSpot-Signature
  // TODO: push to durable queue or handle directly
  return Response.json({ received: events?.length ?? 0 })
}
