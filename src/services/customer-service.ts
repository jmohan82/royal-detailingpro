import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { normalizeMobile, normalizePlate } from "@/lib/normalize";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";

/**
 * Live directory of every customer for this business — used by the billing form's search panel
 * so it can match partial mobile numbers (any substring, not just an exact/prefix match) entirely
 * client-side. A car detailing shop's customer list is small enough (hundreds to low thousands)
 * that pulling the whole list is cheap and keeps the search instant.
 */
export function subscribeCustomers(
  businessId: string,
  onChange: (customers: Customer[]) => void,
  onError: (error: Error) => void,
): () => void {
  const customersQuery = query(collection(db, "customers"), where("businessId", "==", businessId));
  return onSnapshot(
    customersQuery,
    (snapshot) => {
      const customers = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Customer, "id">),
      }));
      onChange(customers);
    },
    onError,
  );
}

/** Live directory of every vehicle for this business — paired with subscribeCustomers for search. */
export function subscribeVehicles(
  businessId: string,
  onChange: (vehicles: Vehicle[]) => void,
  onError: (error: Error) => void,
): () => void {
  const vehiclesQuery = query(collection(db, "vehicles"), where("businessId", "==", businessId));
  return onSnapshot(
    vehiclesQuery,
    (snapshot) => {
      const vehicles = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Vehicle, "id">),
      }));
      onChange(vehicles);
    },
    onError,
  );
}

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
