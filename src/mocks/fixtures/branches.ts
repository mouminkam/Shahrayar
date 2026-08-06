/**
 * PRODUCTION: branches would come from `GET /branches`, `GET /branches/:id`,
 * `GET /branches/default` — see `src/api/branches.ts`.
 */
export const mockBranches = [
  {
    id: 1,
    branch_id: 1,
    name: "Shahrayar — Downtown",
    is_main: true,
    address: "12 Vitosha Boulevard, Sofia, Bulgaria",
    location: "12 Vitosha Boulevard, Sofia, Bulgaria",
    email: "downtown@shahrayar.example",
    contact_email: "downtown@shahrayar.example",
    phone: "+359 2 555 0142",
    contact_phone: "+359 2 555 0142",
    working_hours: "09:00 am - 11:00 pm",
    opening_hours: "09:00 am - 11:00 pm",
    latitude: 42.6954,
    longitude: 23.3217,
  },
  {
    id: 2,
    branch_id: 2,
    name: "Shahrayar — Riverside",
    is_main: false,
    address: "48 Maritsa Street, Plovdiv, Bulgaria",
    location: "48 Maritsa Street, Plovdiv, Bulgaria",
    email: "riverside@shahrayar.example",
    contact_email: "riverside@shahrayar.example",
    phone: "+359 32 555 0198",
    contact_phone: "+359 32 555 0198",
    working_hours: "10:00 am - 11:30 pm",
    opening_hours: "10:00 am - 11:30 pm",
    latitude: 42.1354,
    longitude: 24.7453,
  },
];

export function getMockDefaultBranch() {
  return mockBranches.find((b) => b.is_main) || mockBranches[0];
}
