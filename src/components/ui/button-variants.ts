import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white shadow hover:bg-gray-800 active:scale-95",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95",
        outline: "border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 active:scale-95",
        secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 active:scale-95",
        ghost: "hover:bg-gray-100 hover:text-gray-900 active:scale-95",
        link: "text-gray-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)