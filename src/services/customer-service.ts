import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { normalizeMobile, normalizePlate } from "@/lib/normalize";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";

export async function findCustomerByMobile(mobile: string): Promise<Customer | null> {
  const id = normalizeMobile(mobile);
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "customers", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<Customer, "id">) };
}

export async function findVehicleByPlate(plate: string): Promise<Vehicle | null> {
  const id = normalizePlate(plate);
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "vehicles", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<Vehicle, "id">) };
}

export async function findVehiclesForCustomer(customerId: string): Promise<Vehicle[]> {
  const vehiclesQuery = query(collection(db, "vehicles"), where("customerId", "==", customerId));
  const snapshot = await getDocs(vehiclesQuery);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Vehicle, "id">),
  }));
}

export interface CustomerSearchResult {
  found: boolean;
  customer: Customer | null;
  vehicles: Vehicle[];
}

const EMPTY_RESULT: CustomerSearchResult = { found: false, customer: null, vehicles: [] };

export async function searchCustomer(rawQuery: string): Promise<CustomerSearchResult> {
  const trimmed = rawQuery.trim();
  if (!trimmed) return EMPTY_RESULT;

  const looksLikePlate = /[a-zA-Z]/.test(trimmed);

  if (looksLikePlate) {
    const vehicle = await findVehicleByPlate(trimmed);
    if (!vehicle) return EMPTY_RESULT;
    const customer = await findCustomerByMobile(vehicle.customerId);
    if (!customer) return EMPTY_RESULT;
    return { found: true, customer, vehicles: [vehicle] };
  }

  const customer = await findCustomerByMobile(trimmed);
  if (!customer) return EMPTY_RESULT;
  const vehicles = await findVehiclesForCustomer(customer.id);
  return { found: true, customer, vehicles };
}
