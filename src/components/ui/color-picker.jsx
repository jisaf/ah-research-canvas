import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "../../lib/utils"

const ColorPicker = React.forwardRef(({ className, color, onChange, ...props }, ref) => {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          className={cn(
            "h-6 w-6 rounded-md border border-input",
            className
          )}
          style={{ backgroundColor: color }}
          ref={ref}
          {...props}
        />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
          align="start"
        >
          <div className="grid grid-cols-6 gap-2">
            {[
              "#FFFFFF", "#F8F9FA", "#E9ECEF", "#DEE2E6", "#CED4DA", "#ADB5BD",
              "#6C757D", "#495057", "#343A40", "#212529", "#000000",
              "#FF6B6B", "#F06595", "#CC5DE8", "#845EF7", "#5C7CFA", "#339AF0",
              "#22B8CF", "#20C997", "#51CF66", "#94D82D", "#FCC419", "#FF922B"
            ].map((c) => (
              <button
                key={c}
                className={cn(
                  "h-6 w-6 rounded-md border border-input",
                  color === c && "ring-2 ring-ring"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
})
ColorPicker.displayName = "ColorPicker"

export { ColorPicker }