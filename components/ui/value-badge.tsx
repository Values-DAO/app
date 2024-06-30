import React from "react";
import {Badge} from "./badge";

const ValueBadge = ({value, weight}: {value: string; weight?: string}) => {
  const capitalizedValue =
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  return (
    <Badge
      variant="outline"
      className="rounded-sm text-[18px] text-nowrap w-fit border-2 border-primary"
    >
      {capitalizedValue} {weight && `(${weight})`}
    </Badge>
  );
};

export default ValueBadge;
