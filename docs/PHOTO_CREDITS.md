# Photo credits

Photos replaced in this pass, all from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license) (free for commercial and non-commercial
use, no permission or attribution required — listed here anyway, for traceability).

## Why these specific files

Most of these were not "blurry" — a scan of every image under `public/img` for the
`rgb(184,184,184)` template-placeholder signature found **9 files that were literal
`"WxH"` gray placeholder stubs still wired into live mock data**: 5 menu dishes, 3
desserts, and the burger item (`src/mocks/fixtures/menuItems.ts`), plus the demo user's
own avatar (`src/mocks/fixtures/users.ts`). Anyone testing checkout → order history, or
logging into `/profile`, would have hit a gray box with text on it. Those were the
priority. The three chef portraits (`src/content/restaurant.ts`) were real photos already,
just under-resolved for how large the about-us cards render them — replaced for
sharpness, not brokenness. A 4th chef entry in `src/mocks/fixtures/chefs.ts`
(`getChefs()`) is currently dead code — no component calls it — but was fixed too since
it was a one-line addition once the rest of the pipeline existed.

## Dishes (`public/img/dishes/`)

| File | Menu item | Unsplash photo |
|---|---|---|
| `dishes3_1.jpg` | Chicken Shawarma Wrap | [photo-1653379557259](https://unsplash.com/photos/1653379557259-48a725b08460) |
| `dishes3_2.jpg` | Mixed Grill Platter | [photo-1555939594](https://unsplash.com/photos/1555939594-58d7cb561ad1) |
| `dishes3_3.jpg` | Lamb Kofta Skewers | [photo-1740591872073](https://unsplash.com/photos/1740591872073-e0e627756b90) |
| `dishes3_4.jpg` | Beef Shawarma Plate | [photo-1529006557810](https://unsplash.com/photos/1529006557810-274b9b2fc783) |
| `dishes3_5.jpg` | Chicken Tikka Skewers | [photo-1603360946369](https://unsplash.com/photos/1603360946369-dc9bb6258143) |
| `burger.png` | Shahrayar Signature Burger | [photo-1611077854917](https://unsplash.com/photos/1611077854917-291673c6ae06) |
| `dishes6_1.png` | Kunafa | [photo-1783199352933](https://unsplash.com/photos/1783199352933-1cbbc176eb0c) |
| `dishes6_2.png` | Baklava (4 pcs) | [photo-1778448563279](https://unsplash.com/photos/1778448563279-e7b39093933c) |
| `dishes6_3.png` | Chocolate Lava Cake | [photo-1652561781059](https://unsplash.com/photos/1652561781059-58d5d9ffcb4d) |

## People

| File | Used for | Unsplash photo |
|---|---|---|
| `chefe/chefeThumb1_1.png` | Omar Haddad, Head Chef | [photo-1721924960760](https://unsplash.com/photos/1721924960760-bb134eb9c679) |
| `chefe/chefeThumb1_2.png` | Layla Nasser, Pastry & Desserts | [photo-1701878198293](https://unsplash.com/photos/1701878198293-d1f3641efdb3) |
| `chefe/chefeThumb1_3.png` | Karim Aziz, Wood-Fired Oven | [photo-1689588532679](https://unsplash.com/photos/1689588532679-4bb5fdd8f6d5) |
| `chefe/chefeThumb1_4.png` | Rana Yousef *(mocks/fixtures/chefs.ts only — currently unused)* | [photo-1731576089290](https://unsplash.com/photos/1731576089290-e6230a18dcb4) |
| `profile/profile.png` | Demo account avatar (Yousef Al-Sayed) | [photo-1651684215020](https://unsplash.com/photos/1651684215020-f7a5b6610f23) |

The three real chefs (`chefeThumb1_1/2/3.png`) are not plain photo swaps: the original
files are a pre-composited design — a rounded top-left corner and a diagonal red accent
stroke baked into the PNG itself, with the photo filling the rest. The new portraits were
composited into that exact same mask (alpha channel + red-pixel detection lifted from the
original file), at 2x resolution, so the decorative treatment is pixel-identical to before
and only the photo underneath changed.

## Not touched, and why

`public/img` has ~65 more files carrying the same gray-placeholder signature
(`gallery/*2_*.jpg`, `blog/*`, `contact/*`, `cta/*`, `services/*`, `wcu/*`,
`banner/*2_*.png`, `header/home*.jpg`, `testimonial/*2_*` and `*3_*`, `bg/*BG2_*` /
`*BG3_*`). Every one of them was checked against `src/` with `git grep` and **none are
referenced by any component** — they're unused leftovers from the original template
scaffold, not live bugs. Fixing them would just be downloading stock photos nobody will
ever see, so they were left alone. If any of them get wired up to real content later,
run the same `rgb(184,184,184)`-signature scan described above to find the full list.
