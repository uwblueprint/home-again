"""inventory

Revision ID: 20261114_inventory
Revises: 20261105_public_rls
Create Date: 2026-11-14

Add the inventory table: one row per item type Home Again gives out, with a
quantity. The rows are the referral form's item list and categories (sized
items get one row per size), with ids matching the form's item ids.

- Create inventory and enable RLS on it, like every other public table
- Seed it from the referral form's items, quantity 0
- Add furniture.inventory_id and backfill it for existing furniture whose name
  matches an item type (including the donate form's names, e.g. "Sofa")
"""

from datetime import datetime, timezone

import sqlalchemy as sa
from alembic import op

revision = "20261114_inventory"
down_revision = "20261105_public_rls"
branch_labels = None
depends_on = None

# (id, name, size, category), in the referral form's order. Copied rather than
# imported so this migration doesn't change if the form does.
ITEMS = [
    ("sofa-couch", "Sofa/Couch", None, "Seating"),
    ("love-seat", "Love Seat", None, "Seating"),
    ("rocker-glider-recliner", "Rocker/Glider/Recliner", None, "Seating"),
    ("kitchen-dining-chair", "Kitchen/Dining Chair", None, "Seating"),
    ("upholstered-arm-chair", "Upholstered Arm Chair", None, "Seating"),
    ("desk-chair", "Desk Chair", None, "Seating"),
    ("dresser", "Dresser", None, "Storage and Shelving"),
    ("youth-small-dresser", "Youth/Small Dresser", None, "Storage and Shelving"),
    ("night-stand", "Night Stand", None, "Storage and Shelving"),
    ("armoire", "Armoire", None, "Storage and Shelving"),
    ("bookcase", "Bookcase", None, "Storage and Shelving"),
    ("microwave-stand", "Microwave Stand", None, "Storage and Shelving"),
    ("tv-stand", "TV Stand", None, "Storage and Shelving"),
    ("laundry-basket", "Laundry Basket", None, "Storage and Shelving"),
    ("hangers", "Hangers", None, "Storage and Shelving"),
    ("box-spring-only-twin", "Box Spring Only", "Twin", "Bed"),
    ("box-spring-only-double", "Box Spring Only", "Double", "Bed"),
    ("box-spring-only-queen", "Box Spring Only", "Queen", "Bed"),
    ("mattress-only-twin", "Mattress Only", "Twin", "Bed"),
    ("mattress-only-double", "Mattress Only", "Double", "Bed"),
    ("mattress-only-queen", "Mattress Only", "Queen", "Bed"),
    ("metal-bed-frame-tw-db", "Metal Bed Frame", "TW/DB", "Bed"),
    ("metal-bed-frame-db-qn", "Metal Bed Frame", "DB/QN", "Bed"),
    ("captains-bed", "Captain's/Mate's Bed", None, "Bed"),
    ("toaster", "Toaster", None, "Electronics"),
    ("radio", "Radio", None, "Electronics"),
    ("table-lamp", "Table Lamp", None, "Electronics"),
    ("coffee-maker", "Coffee Maker", None, "Electronics"),
    ("microwave", "Microwave", None, "Electronics"),
    ("flatscreen-tv", "Flatscreen T.V.", None, "Electronics"),
    ("clock", "Clock", None, "Electronics"),
    ("dining-kitchen-table", "Dining/Kitchen Table", None, "Tables"),
    ("side-end-table", "Side/End Table", None, "Tables"),
    ("coffee-table", "Coffee Table", None, "Tables"),
    ("desk", "Desk", None, "Tables"),
]

# Existing furniture names (lower-cased) → inventory id. Covers the unsized
# referral names and the donate form's names. Sized donate types ("Mattress",
# "Boxspring", "Bed frames") and "Other" don't say which row they are, so they
# stay unmatched.
NAME_TO_INVENTORY = {
    **{name.lower(): item_id for item_id, name, size, _ in ITEMS if size is None},
    "sofa": "sofa-couch",
    "loveseat": "love-seat",
    "plush chair": "upholstered-arm-chair",
    "bookshelf": "bookcase",
    "lamp": "table-lamp",
    "tv stand": "tv-stand",
    "coffee table": "coffee-table",
    "side/end table": "side-end-table",
    "dining table & chairs /sets": "dining-kitchen-table",
}


def upgrade():
    inventory = op.create_table(
        "inventory",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("size", sa.String(50), nullable=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.CheckConstraint("quantity >= 0", name="inventory_quantity_non_negative"),
    )
    op.execute('ALTER TABLE public."inventory" ENABLE ROW LEVEL SECURITY')

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    op.bulk_insert(
        inventory,
        [
            {
                "id": item_id,
                "name": name,
                "size": size,
                "category": category,
                "quantity": 0,
                "position": position,
                "created_at": now,
                "updated_at": now,
            }
            for position, (item_id, name, size, category) in enumerate(ITEMS)
        ],
    )

    op.add_column("furniture", sa.Column("inventory_id", sa.String(64), nullable=True))
    op.create_foreign_key(
        "furniture_inventory_id_fkey",
        "furniture",
        "inventory",
        ["inventory_id"],
        ["id"],
    )
    op.create_index("ix_furniture_inventory_id", "furniture", ["inventory_id"])

    furniture = sa.table(
        "furniture", sa.column("name", sa.String), sa.column("inventory_id")
    )
    for name, inventory_id in NAME_TO_INVENTORY.items():
        op.execute(
            furniture.update()
            .where(sa.func.lower(sa.func.trim(furniture.c.name)) == name)
            .values(inventory_id=inventory_id)
        )


def downgrade():
    op.drop_index("ix_furniture_inventory_id", table_name="furniture")
    op.drop_constraint("furniture_inventory_id_fkey", "furniture", type_="foreignkey")
    op.drop_column("furniture", "inventory_id")
    op.drop_table("inventory")
