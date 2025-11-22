import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import type { ProductFilters, FilterOptions } from '../../types/product';

interface ProductFilterProps {
  filters: ProductFilters;
  filterOptions: FilterOptions | null;
  categories: Category[];
  onUpdateFilter: (key: keyof ProductFilters, value: ProductFilters[keyof ProductFilters]) => void;
  onToggleArrayFilter: (key: 'sizes' | 'colors' | 'brands', value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  filters,
  filterOptions,
  categories,
  onUpdateFilter,
  onToggleArrayFilter,
  onClearFilters,
  hasActiveFilters,
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A to Z' },
    { value: 'name-z-a', label: 'Name: Z to A' },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => onUpdateFilter('search', e.target.value)}
        />
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <select
          className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-950"
          value={filters.category || ''}
          onChange={(e) => onUpdateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onUpdateFilter('minPrice', e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onUpdateFilter('maxPrice', e.target.value)}
            className="flex-1"
          />
        </div>
        {filterOptions && (
          <p className="text-xs text-gray-500">
            Range: ${filterOptions.priceRange.min} - ${filterOptions.priceRange.max}
          </p>
        )}
      </div>

      <Separator />

      {/* Size Filter */}
      {filterOptions && filterOptions.sizes.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Size</Label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.sizes.map((size) => (
                <Badge
                  key={size}
                  variant={(filters.sizes || []).includes(size) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onToggleArrayFilter('sizes', size)}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Color Filter */}
      {filterOptions && filterOptions.colors.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.colors.map((color) => (
                <Badge
                  key={color}
                  variant={(filters.colors || []).includes(color) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onToggleArrayFilter('colors', color)}
                >
                  {color}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Brand Filter */}
      {filterOptions && filterOptions.brands.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Brand</Label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.brands.map((brand) => (
                <Badge
                  key={brand}
                  variant={(filters.brands || []).includes(brand) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onToggleArrayFilter('brands', brand)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="inStock"
          checked={filters.inStock || false}
          onChange={(e) => onUpdateFilter('inStock', e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="inStock">In Stock Only</Label>
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-2">
        <Label htmlFor="sort">Sort By</Label>
        <select
          id="sort"
          className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-950"
          value={filters.sort || 'newest'}
          onChange={(e) => onUpdateFilter('sort', e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-auto">
                Active
              </Badge>
            )}
          </div>
          <FilterContent />
        </div>
      </div>
    </>
  );
};