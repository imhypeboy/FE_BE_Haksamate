import { Heart, MapPin, Star } from "lucide-react"
import type { SegmentItem } from "../types"

export const DRAG_THRESHOLD = 100
export const SWIPE_VELOCITY = 400
export const ANIMATION_DURATION = 600

export const SEGMENTS: SegmentItem[] = [
  { id: "matching", label: "매칭", icon: Heart },
  { id: "nearby", label: "근처", icon: MapPin },
  { id: "liked", label: "좋아요", icon: Star },
]
