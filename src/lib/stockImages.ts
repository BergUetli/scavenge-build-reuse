/**
 * Stock Component Images
 * Maps component names/categories to stock image keys for v0.7
 */

export const STOCK_IMAGES: Record<string, string> = {
  // Power Components
  'battery': '/stock/battery.svg',
  'power supply': '/stock/power-supply.svg',
  'voltage regulator': '/stock/voltage-regulator.svg',
  'transformer': '/stock/transformer.svg',
  'power management': '/stock/power-ic.svg',
  
  // ICs/Chips
  'processor': '/stock/processor.svg',
  'cpu': '/stock/cpu.svg',
  'gpu': '/stock/gpu.svg',
  'memory': '/stock/memory.svg',
  'ram': '/stock/ram.svg',
  'flash': '/stock/flash-memory.svg',
  'controller': '/stock/controller.svg',
  'soc': '/stock/soc.svg',
  'chip': '/stock/ic-chip.svg',
  
  // Display/LEDs
  'display': '/stock/display.svg',
  'lcd': '/stock/lcd.svg',
  'oled': '/stock/oled.svg',
  'led': '/stock/led.svg',
  'screen': '/stock/screen.svg',
  'backlight': '/stock/backlight.svg',
  
  // Camera
  'camera': '/stock/camera.svg',
  'lens': '/stock/lens.svg',
  'image sensor': '/stock/image-sensor.svg',
  
  // Sensors
  'sensor': '/stock/sensor.svg',
  'accelerometer': '/stock/accelerometer.svg',
  'gyroscope': '/stock/gyroscope.svg',
  'proximity sensor': '/stock/proximity-sensor.svg',
  'ambient light sensor': '/stock/light-sensor.svg',
  'microphone': '/stock/microphone.svg',
  
  // Connectors
  'connector': '/stock/connector.svg',
  'usb': '/stock/usb.svg',
  'port': '/stock/port.svg',
  'jack': '/stock/audio-jack.svg',
  'socket': '/stock/socket.svg',
  
  // Electromechanical
  'motor': '/stock/motor.svg',
  'vibrator': '/stock/vibrator.svg',
  'speaker': '/stock/speaker.svg',
  'buzzer': '/stock/buzzer.svg',
  'switch': '/stock/switch.svg',
  'button': '/stock/button.svg',
  
  // Passive Components
  'resistor': '/stock/resistor.svg',
  'capacitor': '/stock/capacitor.svg',
  'inductor': '/stock/inductor.svg',
  'diode': '/stock/diode.svg',
  'transistor': '/stock/transistor.svg',
  
  // PCB
  'pcb': '/stock/pcb.svg',
  'circuit board': '/stock/pcb.svg',
  'motherboard': '/stock/motherboard.svg',
  
  // Mechanical
  'housing': '/stock/housing.svg',
  'frame': '/stock/frame.svg',
  'bracket': '/stock/bracket.svg',
  'screw': '/stock/screw.svg',
  'spring': '/stock/spring.svg',
  
  // Default
  'default': '/stock/component.svg'
};

export function getStockImage(componentName: string, category?: string): string {
  if (!componentName) return STOCK_IMAGES['default'];
  
  const lowerName = componentName.toLowerCase();
  
  // Try exact match on component name
  for (const [key, value] of Object.entries(STOCK_IMAGES)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  // Try category match
  if (category) {
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(STOCK_IMAGES)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
  }
  
  return STOCK_IMAGES['default'];
}

// Fallback SVG data URLs for common components
export const FALLBACK_SVGS: Record<string, string> = {
  'component': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjRjFGNUY5Ii8+CiAgPHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjNjQ3NDhCIi8+Cjwvc3ZnPgo=',
  'chip': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjRURFOUZFIi8+CiAgPHJlY3QgeD0iMTQiIHk9IjE0IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSIyIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjwvc3ZnPgo=',
  'battery': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjRkZFNURDIi8+CiAgPHJlY3QgeD0iMTAiIHk9IjE2IiB3aWR0aD0iMjQiIGhlaWdodD0iMTYiIHJ4PSIyIiBmaWxsPSIjRkY2QjM1Ii8+CiAgPHJlY3QgeD0iMzQiIHk9IjIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiByeD0iMSIgZmlsbD0iI0ZGNkIzNSIvPgo8L3N2Zz4K'
};
