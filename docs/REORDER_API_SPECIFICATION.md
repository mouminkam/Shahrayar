# Reorder API Specification - Backend Requirements

## Endpoint
`POST /api/v1/orders/{order_id}/reorder`

## Current Response (Incomplete)
```json
{
    "success": true,
    "data": {
        "items": [
            {
                "menu_item_id": 10,
                "size_id": 25,
                "quantity": 2,
                "special_instructions": null,
                "selected_ingredients": [10, 11, 9]
            }
        ],
        "missing_items": []
    },
    "message": "messages.order.reorder_success"
}
```

## Required Response (Complete)
The backend MUST return ALL customization data that was in the original order. The response should match the structure of `order_items` from the `GET /orders/{order_id}` endpoint.

### Required Response Structure:
```json
{
    "success": true,
    "data": {
        "items": [
            {
                "menu_item_id": 10,
                "size_id": 25,
                "quantity": 2,
                "special_instructions": null,
                "selected_ingredients": [10, 11, 9],
                "selected_options": [
                    {
                        "option_group_id": 4,
                        "option_item_ids": [3, 5]
                    }
                ],
                "selected_drinks": [1],
                "selected_toppings": null,
                "selected_sauces": null,
                "selected_allergens": null
            }
        ],
        "missing_items": []
    },
    "message": "messages.order.reorder_success"
}
```

## Field Specifications

### Required Fields in `items[]` array:

1. **menu_item_id** (number, required)
   - The menu item ID from the original order

2. **size_id** (number, nullable)
   - The size ID that was selected in the original order
   - Can be `null` if no size was selected

3. **quantity** (number, required)
   - The quantity of this item in the original order

4. **special_instructions** (string, nullable)
   - Any special instructions for this item
   - Can be `null` or empty string

5. **selected_ingredients** (array of numbers, nullable)
   - Array of ingredient IDs that were selected
   - Can be `null` or empty array `[]` if no ingredients were selected
   - Example: `[10, 11, 9]` or `null`

6. **selected_options** (array of objects, nullable) ⚠️ **MISSING - MUST BE ADDED**
   - Array of selected option groups
   - Each object contains:
     - `option_group_id` (number): The option group ID
     - `option_item_ids` (array of numbers): Array of selected option item IDs
   - Can be `null` or empty array `[]` if no options were selected
   - Example: 
     ```json
     [
         {
             "option_group_id": 4,
             "option_item_ids": [3, 5]
         }
     ]
     ```
   - Or `null` if no options were selected

7. **selected_drinks** (array of numbers, nullable) ⚠️ **MISSING - MUST BE ADDED**
   - Array of selected drink IDs from customizations
   - Can be `null` or empty array `[]` if no drinks were selected
   - Example: `[1]` or `null`

8. **selected_toppings** (array of numbers, nullable) ⚠️ **MISSING - MUST BE ADDED**
   - Array of selected topping IDs from customizations
   - Can be `null` or empty array `[]` if no toppings were selected
   - Example: `[3, 5]` or `null`

9. **selected_sauces** (array of numbers, nullable) ⚠️ **MISSING - MUST BE ADDED**
   - Array of selected sauce IDs from customizations
   - Can be `null` or empty array `[]` if no sauces were selected
   - Example: `[2]` or `null`

10. **selected_allergens** (array of numbers, nullable) ⚠️ **MISSING - MUST BE ADDED**
    - Array of selected allergen IDs from customizations
    - Can be `null` or empty array `[]` if no allergens were selected
    - Example: `[1, 2]` or `null`

### Other Fields:

- **missing_items** (array, required)
  - Array of items that are no longer available
  - Should contain objects with at least `menu_item_id` to identify missing items
  - Can be empty array `[]` if all items are available

## Data Source

The backend should extract this data from the `order_items` table/collection, specifically from these fields:
- `selected_ingredients` (already included ✅)
- `selected_options` (MISSING ❌ - must be added)
- `selected_drinks` (MISSING ❌ - must be added)
- `selected_toppings` (MISSING ❌ - must be added)
- `selected_sauces` (MISSING ❌ - must be added)
- `selected_allergens` (MISSING ❌ - must be added)

## Example Complete Response

Based on the order details API response structure, here's a complete example:

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "menu_item_id": 10,
                "size_id": 25,
                "quantity": 2,
                "special_instructions": null,
                "selected_ingredients": [10, 11, 9],
                "selected_options": null,
                "selected_drinks": [1],
                "selected_toppings": null,
                "selected_sauces": null,
                "selected_allergens": null
            }
        ],
        "missing_items": []
    },
    "message": "messages.order.reorder_success"
}
```

## Notes for Backend Team

1. **Data Consistency**: The reorder response should return the EXACT same customization data that was stored in the original order's `order_items`.

2. **Null vs Empty Array**: 
   - Use `null` when the field was never set in the original order
   - Use empty array `[]` when the field was set but had no selections
   - However, for consistency with the order details API, prefer `null` for empty customizations

3. **selected_options Format**: 
   - Must match the format from `order_items.selected_options`
   - Array of objects with `option_group_id` and `option_item_ids`

4. **Priority**: This is a **CRITICAL** requirement for the reorder functionality to work correctly. Without these fields, users cannot reorder items with their original customizations.

## Frontend Readiness

The frontend is already prepared to handle this complete response structure. Once the backend implements these fields, the frontend will automatically use them without any additional changes needed.
