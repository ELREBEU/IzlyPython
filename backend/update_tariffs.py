import asyncio
from app.db.supabase import supabase

async def update_tariffs():
    print("🔄 Updating Tariffs Table...")

    # Correct Data
    tariffs = [
        {'code': '98', 'label': 'Boursier', 'izly_cost': 1.00, 'payout_amount': 1.20},
        {'code': '100', 'label': 'Alternant', 'izly_cost': 0.30, 'payout_amount': 0.50},
        {'code': '97', 'label': 'Non-Boursier', 'izly_cost': 3.30, 'payout_amount': 3.30}
    ]

    for t in tariffs:
        # Upsert (Update if exists, Insert if not)
        # Note: Supabase-py doesn't have upsert easily exposed sometimes, so we'll try update then insert
        print(f"Processing {t['label']} ({t['code']})...")
        
        # Check if exists
        res = supabase.table("tariffs").select("*").eq("code", t['code']).execute()
        if res.data:
            # Update
            supabase.table("tariffs").update(t).eq("code", t['code']).execute()
            print(f"  ✅ Updated {t['code']}")
        else:
            # Insert
            supabase.table("tariffs").insert(t).execute()
            print(f"  ✅ Inserted {t['code']}")
    
    # Remove old code 35 if exists
    supabase.table("tariffs").delete().eq("code", "35").execute()
    print("🗑️ Removed old code 35")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(update_tariffs())
