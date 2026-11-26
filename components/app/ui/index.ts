// Las piezas compartidas de las pantallas de datos. Qué hace cada una y sus
// props: README.md de esta carpeta.

export { BudgetRow, BudgetRowsCard, type BudgetRowProps } from "./BudgetRow";
export { Card, PageColumn, type CardProps, type CardVariant } from "./Card";
export { CategoryIcon, type CategoryIconProps } from "./CategoryIcon";
export { Chip, type ChipProps } from "./Chip";
export { Dropdown, type DropdownOption, type DropdownProps } from "./Dropdown";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { Icon, MDI_PATHS, type AnyIconName, type IconName, type IconProps, type MdiName } from "./Icon";
export { MonthPicker, type MonthPickerProps } from "./MonthPicker";
export { Money, type MoneyProps } from "./Money";
export { ProgressBar, type ProgressBarProps } from "./ProgressBar";
export { PulseDot } from "./PulseDot";
export { SectionHeader, type SectionHeaderProps } from "./SectionHeader";
export { ServiceMark, type ServiceMarkProps } from "./ServiceMark";
export { SharedBadge } from "./SharedBadge";
export { RingLegend, SoftHalo, SpendRing, type SpendRingProps } from "./SpendRing";
export { Bone, LoadError, Notice, SkeletonBlock, UseAppNotice } from "./states";

export { appDownloadHref } from "./links";
export { useCategories } from "./useCategories";
export { useFormat } from "./useFormat";
export { useLoad, type LoadState, type UseLoad } from "./useLoad";
export { usePremium } from "./usePremium";

// Lógica pura (sin React), con pruebas en helpers.test.ts.
export { CATEGORY_KEYS, categoryGlyph, categoryTint, getCategory, type Category, type CategoryKey } from "./categories";
export { currentPeriod, monthClock, shortMoney, sortByUse, toneOf, topBudgets, usedShare, type BudgetRowData, type MonthClock, type Tone } from "./budget";
export { currencySymbol } from "./currency";
export {
  LOCALE,
  daysUntil,
  formatDate,
  formatMoney,
  formatMoneyParts,
  initialsFrom,
  installmentLabel,
  localDayKey,
  wholeAmount,
  type DateStyle,
  type MoneyOpts,
} from "./format";
export { FREE_MONTHS, LISTED_MONTHS, isMonthLocked, openableMonths, recentMonths, type MonthOption } from "./months";
export { monthPace, paceState, progressParts, ringColor, ringGeometry, type PaceState } from "./ring";
