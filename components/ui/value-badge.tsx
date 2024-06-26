import React from "react";
import {Badge} from "./badge";

const ValueBadge = ({value, weight}: {value: string; weight?: string}) => {
  const capitalizedValue =
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  return (
    <Badge
      variant="default"
      className="rounded-sm text-[18px] text-nowrap w-fit"
    >
      {capitalizedValue} {weight && `(${weight})`}
    </Badge>
  );
};

export default ValueBadge;
