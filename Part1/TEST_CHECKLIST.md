# Part 1 Manual Test Checklist

## Student Info
- Name: <Your Name>
- Student ID: <Your Student ID>
- Unit: PROG2005

## Functional Tests
- [ ] Add valid item succeeds.
- [ ] Add with duplicate Item ID is rejected.
- [ ] Add with duplicate Item Name is rejected.
- [ ] Update item by name succeeds.
- [ ] Update item by name fails when target does not exist.
- [ ] Delete item by name asks confirmation and deletes only after Yes.
- [ ] Search by item name returns matching rows.
- [ ] Show All restores full list.
- [ ] Popular Only shows only `popular = Yes` rows.
- [ ] Category filter works.
- [ ] Sort by price and quantity works in both directions.
- [ ] Batch delete removes selected rows only.

## Validation Tests
- [ ] Empty Item ID is blocked.
- [ ] Empty Item Name is blocked.
- [ ] Empty Supplier is blocked.
- [ ] Empty Quantity is blocked.
- [ ] Empty Price is blocked.
- [ ] Negative Quantity is blocked.
- [ ] Negative Price is blocked.

## UI / UX Tests
- [ ] Feedback message appears after each action.
- [ ] Table updates immediately after CRUD operations.
- [ ] Layout remains usable on mobile width.

## Notes
- Data is session-only (in-memory) and resets after refresh.
- Confirm dialog is custom modal (not `alert()`).
