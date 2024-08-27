import React from "react";
import {Badge} from "./badge";

const ValueBadge = ({value, weight}: {value: string; weight?: number}) => {
  const capitalizedValue =
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  return (
    <Badge
      variant="outline"
      className="text-primary-foreground text-md border-primary border-2 rounded-md"
    >
      {capitalizedValue}
    </Badge>
  );
};

export default ValueBadge;
