import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function CompetitionCard({ competition }) {
  const { _id, title, organization, eventType, mode, status, timeline, tags } = competition;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link to={`/competitions/${_id}`} className="block">
        <Card className="cursor-pointer hover:border-[var(--primary)]/40 transition-colors h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{title}</CardTitle>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{organization}</p>
              </div>
              <StatusBadge status={status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">{eventType?.replace(/_/g, " ")}</Badge>
              <Badge variant="outline" className="text-xs">{mode}</Badge>
            </div>

            <div className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
              {timeline?.registrationDeadline && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Deadline: {formatDate(timeline.registrationDeadline)}</span>
                </div>
              )}
              {mode !== "ONLINE" && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{competition.location?.city || "Online"}</span>
                </div>
              )}
            </div>

            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-[var(--muted-foreground)]">+{tags.length - 3}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
