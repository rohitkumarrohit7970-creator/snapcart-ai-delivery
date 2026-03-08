
-- Allow delivery boys to view unassigned pending/confirmed orders (available for pickup)
CREATE POLICY "Delivery boy views available orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'delivery_boy') 
  AND delivery_boy_id IS NULL 
  AND status IN ('pending', 'confirmed')
);

-- Allow delivery boys to accept (claim) unassigned orders
CREATE POLICY "Delivery boy accepts orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'delivery_boy') 
  AND delivery_boy_id IS NULL 
  AND status IN ('pending', 'confirmed')
)
WITH CHECK (
  delivery_boy_id = auth.uid()
);

-- Allow delivery boys to view order items for available orders
CREATE POLICY "Delivery boy views available order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.delivery_boy_id IS NULL
    AND orders.status IN ('pending', 'confirmed')
    AND has_role(auth.uid(), 'delivery_boy')
  )
);
