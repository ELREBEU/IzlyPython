import asyncio
from app.db.supabase import supabase

async def cleanup_offers():
    print("🧹 Cleaning up duplicate offers...")

    # 1. Find Nolan's ID
    res = supabase.table("profiles").select("id").eq("email", "nolan.seller@test.com").execute()
    if not res.data:
        print("❌ Nolan not found.")
        return

    nolan_id = res.data[0]["id"]
    print(f"✓ Found Nolan: {nolan_id}")

    # 2. Find all OPEN offers for Nolan
    offers_res = supabase.table("market_offers")\
        .select("id, created_at")\
        .eq("seller_id", nolan_id)\
        .eq("status", "OPEN")\
        .order("created_at", desc=True)\
        .execute()
    
    offers = offers_res.data
    print(f"✓ Found {len(offers)} OPEN offers.")

    if len(offers) > 1:
        # Keep the most recent one (index 0), delete others
        offers_to_delete = offers[1:]
        ids_to_delete = [o["id"] for o in offers_to_delete]
        
        print(f"🗑️ Deleting {len(ids_to_delete)} duplicate offers...")
        for oid in ids_to_delete:
            supabase.table("market_offers").delete().eq("id", oid).execute()
            print(f"   - Deleted {oid}")
            
    print("✅ Cleanup complete. Nolan has 1 OPEN offer max.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(cleanup_offers())
