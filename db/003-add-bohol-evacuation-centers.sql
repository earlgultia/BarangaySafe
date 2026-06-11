-- Add Evacuation Centers for Bohol
-- Starting with Duero, Bohol

INSERT INTO public.evacuation_centers (name, municipality, barangay, address, latitude, longitude, contact_number, capacity, current_occupancy)
VALUES 
  (
    'Manpower Development Center',
    'Duero',
    'Imelda',
    'Barangay Imelda, Duero, Bohol',
    9.5950,
    123.9500,
    '(038) 501-9999',
    150,
    0
  ),
  (
    'Duero Central School',
    'Duero',
    'Poblacion',
    'Poblacion, Duero, Bohol',
    9.5945,
    123.9480,
    '(038) 501-8888',
    200,
    0
  )
ON CONFLICT DO NOTHING;

-- Query to verify insertions
SELECT name, municipality, barangay, latitude, longitude FROM public.evacuation_centers WHERE municipality = 'Duero';
