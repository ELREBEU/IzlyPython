import asyncio
from app.db.supabase import supabase

async def reset_nolan():
    print("🔄 Resetting Nolan's Offer...")

    # 1. Find Nolan
    res = supabase.table("profiles").select("*").eq("email", "nolan.seller@test.com").execute()
    if not res.data:
        print("❌ Nolan not found.")
    else:
        nolan = res.data[0]
        print(f"✓ Found Nolan: {nolan['id']}")
        print(f"  - Email: {nolan['email']}")
        # Passwords are encrypted, so we can't show them, but we know them from seed:
        print(f"  - Known Password (from seed): 'password'") 

    # 2. Find Iness
    res_iness = supabase.table("profiles").select("*").eq("email", "iness.buyer@test.com").execute()
    if res_iness.data:
        iness = res_iness.data[0]
        print(f"✓ Found Iness: {iness['id']}")
        print(f"  - Email: {iness['email']}")
        print(f"  - Known Password (from seed): 'password'")

    # 3. Reset Offer
    if res.data:
        nolan_id = res.data[0]["id"]
        
        # Update ALL offers for Nolan to OPEN (or delete duplicates and keep one)
        offers = supabase.table("market_offers").select("*").eq("seller_id", nolan_id).execute()
        
        if offers.data:
            offer_id = offers.data[0]["id"]
            print(f"✓ Found Offer: {offer_id} (Status: {offers.data[0]['status']})")
            
            # Reset to OPEN
            supabase.table("market_offers").update({"status": "OPEN"}).eq("id", offer_id).execute()
            print("✅ Offer reset to OPEN.")
            
            # Delete associated trade sessions to clean up?
            # User wants to keep history ("trace"), so maybe don't delete sessions?
            # But if he wants to "re-test", maybe he wants a clean slate for THIS offer.
            # Let's just reset the offer status. The old sessions will remain in history.
        else:
            print("❌ No offer found for Nolan.")

    # 4. Check Tariffs Table
    try:
        tariffs = supabase.table("tariffs").select("*").execute()
        print("\n📊 Tariffs Table Content:")
        for t in tariffs.data:
            print(f"  - Code {t.get('code')}: {t}")
    except Exception as e:
        print(f"\n⚠️ Could not read tariffs table: {e}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(reset_nolan())
