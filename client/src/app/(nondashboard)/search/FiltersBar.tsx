import {
  FiltersState,
  setFilters,
  setViewMode,
  toggleFiltersFullOpen,
} from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectValue } from "@radix-ui/react-select";
import { PropertyTypeIcons } from "@/lib/constants";

const FiltersBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [searchInput, setSearchInput] = useState(filters.location);

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const CurrentArrayRange = [...filters[key]];
      if (isMin != null) {
        const index = isMin ? 0 : 1;
        CurrentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = CurrentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput
        )}.json?.access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: searchInput,
            coordinates: [lng, lat],
          })
        );
      }
    } catch (err) {
      console.error("error searching location:", err);
    }
  };

  return (
    <div className="flex justify-between items-center w-full py-5 z-10">
      <div className="flex justify-between items-center gap-4 p-2">
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-600 hover:text-primary-100",
            isFiltersFullOpen && "bg-primary-700 text-primary-100"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="w-4 h-4" />
          <span>All Filters</span>
        </Button>

        <div className="flex items-center">
          <Input
            placeholder="Search location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0 hidden md:block"
          />
          <Button
            onClick={handleLocationSearch}
            className={`rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none 
              border hover:bg-primary-700 hover:text-primary-50 hidden md:block`}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          <Select
            value={filters.priceRange[0]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="w-22 rounded-xl border-primary-400 hidden md:flex">
              <SelectValue>
                {formatPriceValue(filters.priceRange[0], true)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="select-option border-t">
                Any Min Price
              </SelectItem>
              {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem
                  key={price}
                  value={price.toString()}
                  className={`select-option ${
                    price === 10000 ? "border-b" : ""
                  }`}
                >
                  ${price / 1000}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1">
          <Select
            value={filters.priceRange[1]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="w-22 rounded-xl border-primary-400 hidden md:flex">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1], false)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="select-option border-t">
                Any Max Price
              </SelectItem>
              {[1000, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem
                  key={price}
                  value={price.toString()}
                  className={`select-option`}
                >
                  &lt;${price / 1000}k
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1">
          <Select
            value={filters.beds}
            onValueChange={(value) => handleFilterChange("beds", value, null)}
          >
            <SelectTrigger className="w-26 rounded-xl border-primary-400 hidden md:flex">
              <SelectValue placeholder="Beds">
                {filters.beds === "any" ? "Beds" : `${filters.beds}+ Bed`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem className="select-option border-t" value="any">
                Any Beds
              </SelectItem>
              <SelectItem className="select-option" value="1">
                1+ Bed
              </SelectItem>
              <SelectItem className="select-option" value="2">
                2+ Bed
              </SelectItem>
              <SelectItem className="select-option" value="3">
                3+ Bed
              </SelectItem>
              <SelectItem className="select-option border-b" value="4">
                4+ Bed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1">
          <Select
            value={filters.baths}
            onValueChange={(value) => handleFilterChange("baths", value, null)}
          >
            <SelectTrigger className="w-26 rounded-xl border-primary-400 hidden md:flex">
              <SelectValue placeholder="Baths">
                {filters.baths === "any" ? "Baths" : `${filters.baths}+ Baths`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem className="select-option border-t" value="any">
                Any Baths
              </SelectItem>
              <SelectItem className="select-option" value="1">
                1+ Bath
              </SelectItem>
              <SelectItem className="select-option" value="2">
                2+ Baths
              </SelectItem>
              <SelectItem className="select-option border-b" value="3">
                3+ Baths
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1">
          <Select
            value={filters.propertyType || "any"}
            onValueChange={(value) =>
              handleFilterChange("propertyType", value, null)
            }
          >
            <SelectTrigger className="w-32 rounded-xl border-primary-400 hidden md:flex">
              <SelectValue placeholder="Home Type">
                {filters.propertyType === "any"
                  ? "Home Type"
                  : `${filters.propertyType}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="select-option border-t">
                Any Property Type
              </SelectItem>
              {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                <SelectItem key={type} value={type} className="select-option">
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center gap-4 p-2">
          <div className="flex border rounded-xl">
            <Button
              variant="ghost"
              className={cn(
                "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
                viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
              )}
              onClick={() => dispatch(setViewMode("list"))}
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
                viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
              )}
              onClick={() => dispatch(setViewMode("grid"))}
            >
              <Grid className="w-5 h-5"></Grid>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
