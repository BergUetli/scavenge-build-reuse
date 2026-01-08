-- Enable RLS on taxonomy table (was missed)
ALTER TABLE public.scrap_gadget_taxonomy ENABLE ROW LEVEL SECURITY;

-- Taxonomy is read-only reference data
CREATE POLICY "Taxonomy is viewable by everyone"
  ON public.scrap_gadget_taxonomy
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage taxonomy"
  ON public.scrap_gadget_taxonomy
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =============================================
-- SEED DATA: Initial Devices
-- =============================================

-- DEVICE 1: Bose SoundLink Mini II
DO $$
DECLARE
  bose_mini_id UUID;
BEGIN
  INSERT INTO public.scrap_gadgets (
    device_name, brand, model_number, model_name, industry, category, subcategory,
    common_names, visual_identifiers, release_year, disassembly_difficulty,
    disassembly_time_estimate, tools_required, safety_warnings, injury_risk,
    damage_risk, ifixit_url, verified, confidence_score
  ) VALUES (
    'Bose SoundLink Mini II', 'Bose', '725192-1110', 'SoundLink Mini II',
    'Consumer Electronics', 'Bluetooth Speakers', 'Portable Speakers',
    ARRAY['Bose Mini 2', 'SoundLink 2', 'Bose Mini II'],
    '{"color_variants": ["black", "pearl", "carbon"], "ports": ["USB Micro", "AUX 3.5mm"], "dimensions": "180x59x51mm", "weight": "680g"}'::jsonb,
    2015, 'Medium', '20-30 minutes',
    ARRAY['Phillips #0', 'Torx T5', 'Plastic pry tool', 'Spudger'],
    ARRAY['Disconnect battery before disassembly', 'Glued components - apply heat carefully', 'Small screws - keep organized'],
    'Low', 'Medium', 'https://www.ifixit.com/Device/Bose_SoundLink_Mini_II', true, 0.95
  ) RETURNING id INTO bose_mini_id;

  INSERT INTO public.scrap_gadget_components (gadget_id, component_name, category, quantity, specifications, technical_specs, reusability_score, market_value_new, depreciation_rate, description, common_uses, extraction_difficulty, verified, confidence) VALUES
  (bose_mini_id, 'Bluetooth/WiFi Module (CSR8670 or similar)', 'ICs/Chips', 1, 
   '{"type": "Bluetooth 4.0", "range": "30 feet", "protocol": "A2DP, AVRCP"}'::jsonb,
   '{"voltage": "3.3V", "power_rating": "500mA", "part_number": "CSR8670", "notes": "Bluetooth audio SoC with integrated DSP"}'::jsonb,
   9, 15.00, 0.10, 'Bluetooth System-on-Chip for wireless audio streaming.', ARRAY['DIY Bluetooth speakers', 'Arduino/ESP32 wireless audio', 'IoT audio streaming devices'], 'Hard', true, 0.90),
  (bose_mini_id, 'Digital Signal Processor (DSP) Chip', 'ICs/Chips', 1,
   '{"type": "Audio DSP", "channels": "Stereo"}'::jsonb,
   '{"voltage": "3.3V", "part_number": "Unknown (proprietary)", "notes": "Handles EQ, bass boost, volume control"}'::jsonb,
   7, 8.00, 0.15, 'Processes audio signals for optimal sound quality.', ARRAY['Custom audio projects', 'DIY equalizers', 'Audio processing experiments'], 'Hard', true, 0.85),
  (bose_mini_id, 'Class D Audio Amplifier IC', 'ICs/Chips', 1,
   '{"type": "Class D Amplifier", "power": "2x20W"}'::jsonb,
   '{"voltage": "12V", "power_rating": "20W per channel", "part_number": "TI TPA3118D2 (similar)", "notes": "Efficient amplifier for speakers"}'::jsonb,
   9, 5.00, 0.10, 'Efficient power amplifier for driving speakers.', ARRAY['DIY amplifiers', 'Portable speaker builds', 'Car audio systems'], 'Medium', true, 0.92),
  (bose_mini_id, 'Lithium-ion Battery Pack', 'Power', 1,
   '{"capacity": "2600mAh", "voltage": "7.4V", "type": "Li-ion"}'::jsonb,
   '{"voltage": "7.4V", "power_rating": "2600mAh", "notes": "2S1P configuration, protected"}'::jsonb,
   8, 12.00, 0.20, 'Rechargeable battery pack. Good for powering portable projects.', ARRAY['Portable power banks', 'DIY speaker power', 'Arduino projects', 'LED lights'], 'Easy', true, 0.95),
  (bose_mini_id, 'Battery Management System (BMS)', 'ICs/Chips', 1,
   '{"protection": "Overcharge, overdischarge, short circuit"}'::jsonb,
   '{"voltage": "7.4V", "part_number": "TI BQ24195 (similar)", "notes": "Protects and charges Li-ion battery"}'::jsonb,
   8, 3.00, 0.12, 'Battery protection and charging circuit.', ARRAY['DIY power banks', 'Battery charging circuits', 'Solar chargers'], 'Medium', true, 0.88),
  (bose_mini_id, 'USB Charging Port (Micro-B)', 'Connectors', 1,
   '{"type": "USB Micro-B", "rating": "5V 2A"}'::jsonb,
   '{"voltage": "5V", "power_rating": "2A", "notes": "Standard USB charging port"}'::jsonb,
   7, 0.50, 0.05, 'USB charging connector.', ARRAY['Charging circuits', 'USB power supplies', 'DIY electronics'], 'Easy', true, 0.95),
  (bose_mini_id, '3.5mm Audio Jack (AUX)', 'Connectors', 1,
   '{"type": "3.5mm stereo", "contacts": "3 (TRS)"}'::jsonb,
   '{"voltage": "Audio line level", "notes": "Standard auxiliary input"}'::jsonb,
   6, 0.30, 0.05, '3.5mm stereo jack for wired audio input.', ARRAY['Audio mixers', 'DIY audio interfaces', 'Headphone jacks'], 'Easy', true, 0.95),
  (bose_mini_id, 'Full-Range Speaker Drivers', 'Electromechanical', 2,
   '{"size": "40mm", "impedance": "4 ohm", "power": "10W each"}'::jsonb,
   '{"power_rating": "10W", "notes": "High-quality neodymium drivers"}'::jsonb,
   9, 8.00, 0.08, 'High-quality compact speakers.', ARRAY['DIY Bluetooth speakers', 'Computer speakers', 'Portable audio', 'Monitor speakers'], 'Easy', true, 0.98),
  (bose_mini_id, 'Passive Radiator (Bass Port)', 'Electromechanical', 2,
   '{"size": "50mm", "type": "Passive radiator"}'::jsonb,
   '{"notes": "Weighted diaphragm for bass enhancement"}'::jsonb,
   5, 2.00, 0.10, 'Passive bass radiator.', ARRAY['Speaker enclosure design', 'DIY subwoofers', 'Bass enhancement'], 'Easy', true, 0.90),
  (bose_mini_id, 'LED Indicators', 'Display/LEDs', 5,
   '{"colors": ["white", "blue", "red"], "type": "SMD LED"}'::jsonb,
   '{"voltage": "3.3V", "notes": "Status indicators for power, Bluetooth, battery"}'::jsonb,
   6, 0.10, 0.05, 'Status LEDs.', ARRAY['Status indicators', 'DIY electronics', 'Arduino projects'], 'Medium', true, 0.85),
  (bose_mini_id, 'Control Buttons (Tactile Switches)', 'Electromechanical', 6,
   '{"type": "Tactile switch", "actuation": "Dome contact"}'::jsonb,
   '{"voltage": "3.3V", "notes": "Power, volume, Bluetooth pairing buttons"}'::jsonb,
   7, 0.20, 0.05, 'Tactile push buttons.', ARRAY['DIY interfaces', 'Arduino buttons', 'Control panels'], 'Easy', true, 0.92),
  (bose_mini_id, 'Main PCB (Printed Circuit Board)', 'PCB', 1,
   '{"layers": "4-layer", "components": "SMD"}'::jsonb,
   '{"notes": "Complex multi-layer board with SMD components"}'::jsonb,
   4, 10.00, 0.20, 'Main circuit board.', ARRAY['PCB recycling', 'Copper recovery', 'Electronics education'], 'Hard', true, 0.95),
  (bose_mini_id, 'Electrolytic Capacitors (Various)', 'Passive Components', 10,
   '{"values": "10uF-1000uF", "voltage": "16V-25V"}'::jsonb,
   '{"voltage": "16V-25V", "notes": "Power supply filtering and audio coupling"}'::jsonb,
   6, 0.50, 0.08, 'Power supply and audio filtering capacitors.', ARRAY['Power supply circuits', 'Audio filters', 'DIY amplifiers'], 'Medium', true, 0.80),
  (bose_mini_id, 'SMD Capacitors and Resistors', 'Passive Components', 50,
   '{"type": "SMD", "sizes": "0402, 0603, 0805"}'::jsonb,
   '{"notes": "Various values for signal processing"}'::jsonb,
   3, 0.01, 0.05, 'Surface mount passive components.', ARRAY['PCB repair', 'Electronics learning', 'SMD practice'], 'Hard', true, 0.70);
END $$;


-- DEVICE 2: Apple AirPods Pro (1st Gen)
DO $$
DECLARE
  airpods_id UUID;
BEGIN
  INSERT INTO public.scrap_gadgets (
    device_name, brand, model_number, model_name, industry, category, subcategory,
    common_names, visual_identifiers, release_year, disassembly_difficulty,
    disassembly_time_estimate, tools_required, safety_warnings, injury_risk,
    damage_risk, ifixit_url, verified, confidence_score
  ) VALUES (
    'Apple AirPods Pro (1st Generation)', 'Apple', 'A2084', 'AirPods Pro',
    'Consumer Electronics', 'Headphones & Earbuds', 'Wireless Earbuds',
    ARRAY['AirPods Pro', 'AirPods Pro 1', 'APP1'],
    '{"color_variants": ["white"], "features": ["Active Noise Cancelling", "Transparency Mode"], "case_dimensions": "60x45x21mm"}'::jsonb,
    2019, 'Hard', '45 minutes - 1 hour',
    ARRAY['Heat gun', 'Precision knife', 'Tweezers', 'Isopropyl alcohol'],
    ARRAY['Heavily glued - requires heat and patience', 'Very small components - easy to lose', 'Non-rechargeable batteries - handle with care'],
    'Medium', 'High', 'https://www.ifixit.com/Device/AirPods_Pro', true, 0.92
  ) RETURNING id INTO airpods_id;

  INSERT INTO public.scrap_gadget_components (gadget_id, component_name, category, quantity, specifications, technical_specs, reusability_score, market_value_new, depreciation_rate, description, common_uses, extraction_difficulty, verified, confidence) VALUES
  (airpods_id, 'Apple H1 Chip (System-in-Package)', 'ICs/Chips', 2,
   '{"type": "Wireless audio SoC", "features": "Bluetooth 5.0, Hey Siri, low latency"}'::jsonb,
   '{"part_number": "Apple H1 (338S00397)", "notes": "Proprietary Apple chip - limited reusability"}'::jsonb,
   2, 20.00, 0.25, 'Apple proprietary wireless chip. Very limited reuse outside Apple ecosystem.', ARRAY['Electronics recycling', 'Chip collectors'], 'Hard', true, 0.95),
  (airpods_id, 'Lithium-ion Battery (per earbud)', 'Power', 2,
   '{"capacity": "93.4mWh", "voltage": "3.8V", "type": "Li-ion coin cell"}'::jsonb,
   '{"voltage": "3.8V", "notes": "Very small coin cell, non-replaceable design"}'::jsonb,
   5, 5.00, 0.30, 'Tiny rechargeable batteries.', ARRAY['Tiny LED projects', 'Wearable electronics', 'Sensor nodes'], 'Hard', true, 0.88),
  (airpods_id, 'Microphone (Beamforming)', 'Sensors', 4,
   '{"type": "MEMS microphone", "features": "Dual beamforming"}'::jsonb,
   '{"voltage": "1.8V-3.3V", "notes": "High-quality MEMS mics for voice calls"}'::jsonb,
   7, 2.00, 0.15, 'High-quality miniature microphones.', ARRAY['Voice recording', 'DIY smart assistants', 'Arduino audio input'], 'Hard', true, 0.85),
  (airpods_id, 'Accelerometer (Motion Sensor)', 'Sensors', 2,
   '{"type": "MEMS accelerometer", "axes": "3-axis"}'::jsonb,
   '{"voltage": "1.8V-3.3V", "notes": "Detects ear insertion and head movements"}'::jsonb,
   8, 3.00, 0.12, 'Motion sensor for detecting wearing and gestures.', ARRAY['Wearable devices', 'Motion detection', 'Fitness trackers'], 'Hard', true, 0.82),
  (airpods_id, 'Optical Sensor (Ear Detection)', 'Sensors', 2,
   '{"type": "Infrared proximity sensor"}'::jsonb,
   '{"notes": "Detects when earbuds are in ear"}'::jsonb,
   6, 1.50, 0.15, 'IR proximity sensor.', ARRAY['Proximity detection', 'DIY sensors', 'Automatic triggers'], 'Hard', true, 0.80),
  (airpods_id, 'Speaker Driver (per earbud)', 'Audio', 2,
   '{"type": "Dynamic driver", "size": "Small custom"}'::jsonb,
   '{"notes": "High-quality miniature speaker"}'::jsonb,
   6, 5.00, 0.15, 'Miniature high-fidelity speaker.', ARRAY['Earbud repairs', 'Miniature speakers', 'DIY in-ear monitors'], 'Medium', true, 0.90);
END $$;


-- DEVICE 3: Logitech G502 Gaming Mouse
DO $$
DECLARE
  g502_id UUID;
BEGIN
  INSERT INTO public.scrap_gadgets (
    device_name, brand, model_number, model_name, industry, category, subcategory,
    common_names, visual_identifiers, release_year, disassembly_difficulty,
    disassembly_time_estimate, tools_required, safety_warnings, injury_risk, damage_risk, verified, confidence_score
  ) VALUES (
    'Logitech G502 HERO Gaming Mouse', 'Logitech', '910-005469', 'G502 HERO',
    'Consumer Electronics', 'Gaming Peripherals', 'Mice',
    ARRAY['G502', 'G502 Hero', 'Logitech G502'],
    '{"color_variants": ["black"], "features": ["RGB lighting", "11 buttons", "Adjustable weight"], "dpi": "100-25600"}'::jsonb,
    2018, 'Easy', '10-15 minutes',
    ARRAY['Phillips #00', 'Plastic pry tool'],
    ARRAY['Disconnect cable before disassembly', 'Keep track of small screws'],
    'Low', 'Low', true, 0.95
  ) RETURNING id INTO g502_id;

  INSERT INTO public.scrap_gadget_components (gadget_id, component_name, category, quantity, specifications, technical_specs, reusability_score, market_value_new, depreciation_rate, description, common_uses, extraction_difficulty, verified, confidence) VALUES
  (g502_id, 'Optical Sensor (HERO 25K)', 'Sensors', 1,
   '{"type": "Optical gaming sensor", "dpi": "100-25600", "ips": "400+"}'::jsonb,
   '{"part_number": "PMW3389 (or similar HERO)", "notes": "High-performance gaming sensor"}'::jsonb,
   9, 10.00, 0.12, 'Industry-leading optical gaming sensor.', ARRAY['DIY gaming mice', 'Robot navigation', 'Optical tracking systems'], 'Medium', true, 0.95),
  (g502_id, 'Microcontroller (MCU)', 'ICs/Chips', 1,
   '{"type": "ARM Cortex-M", "features": "Onboard memory for profiles"}'::jsonb,
   '{"voltage": "3.3V", "part_number": "STM32 (similar)", "notes": "Controls all mouse functions"}'::jsonb,
   8, 3.00, 0.15, 'Microcontroller for input processing.', ARRAY['Arduino alternatives', 'Embedded systems', 'DIY controllers'], 'Hard', true, 0.88),
  (g502_id, 'Omron Micro Switches (Mouse Buttons)', 'Electromechanical', 11,
   '{"type": "Omron D2FC-F-7N", "rating": "20 million clicks", "actuation": "50g"}'::jsonb,
   '{"voltage": "5V", "power_rating": "100mA", "part_number": "D2FC-F-7N", "notes": "Premium gaming switches"}'::jsonb,
   9, 1.50, 0.08, 'High-quality tactile switches.', ARRAY['Keyboard repairs', 'DIY game controllers', 'Button replacements', 'Arduino buttons'], 'Easy', true, 0.98),
  (g502_id, 'Scroll Wheel Encoder', 'Electromechanical', 1,
   '{"type": "Rotary encoder", "features": "Infinite scroll, ratchet mode"}'::jsonb,
   '{"voltage": "3.3V-5V", "notes": "Dual-mode encoder with mechanical switch"}'::jsonb,
   8, 3.00, 0.10, 'Precision scroll wheel encoder.', ARRAY['Volume knobs', 'DIY interfaces', 'Robot controls', 'Arduino input'], 'Easy', true, 0.92),
  (g502_id, 'RGB LEDs (Addressable)', 'Display/LEDs', 3,
   '{"type": "RGB LED", "control": "Addressable (WS2812-like)"}'::jsonb,
   '{"voltage": "5V", "notes": "Programmable RGB lighting zones"}'::jsonb,
   8, 0.50, 0.08, 'Addressable RGB LEDs.', ARRAY['LED strips', 'PC case lighting', 'DIY RGB projects', 'Arduino effects'], 'Medium', true, 0.90),
  (g502_id, 'USB Cable (Braided)', 'Connectors', 1,
   '{"type": "USB Type-A to Micro-B", "length": "2.1m", "features": "Braided cable"}'::jsonb,
   '{"voltage": "5V", "notes": "High-quality braided cable"}'::jsonb,
   7, 5.00, 0.10, 'Durable braided USB cable.', ARRAY['Device charging', 'Cable repairs', 'DIY USB devices'], 'Easy', true, 0.95),
  (g502_id, 'Weight System (Adjustable)', 'Other', 5,
   '{"type": "Tungsten weights", "weight": "3.6g each"}'::jsonb,
   '{"notes": "Removable weights for customization"}'::jsonb,
   4, 1.00, 0.05, 'Adjustable weights for balance.', ARRAY['Counterweights', 'DIY projects', 'Balance adjustments'], 'Easy', true, 0.85);
END $$;