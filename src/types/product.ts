export type RoutineSlot = 'morning' | 'evening' | 'both';

export type SkincareProduct = {
  id: string;
  name: string;
  brand: string;
  concern: string;
  routine: RoutineSlot;
  active: boolean;
};
