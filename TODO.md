# TODO — Fix search icon alignment in search boxes

## Problem
In `master-menu-group`, `sub-menu-group`, and `masters` pages, the search box is a
flex item without a fixed width, so it collapses to content width and the
search icon (which is `position:absolute; right:13px`) appears on the **left**
of the input instead of the **right**. In `menu-access` the search box is wrapped
in `<div style="min-width:260px;">` so the icon sits correctly on the right.

## Steps
- [x] Read all relevant files (menu-access, master-menu-group, sub-menu-group, masters, common.scss)
- [x] Confirm plan with user
- [x] Add `.toolbar-row .search-box { width: 280px }` to master-menu-group.scss
- [x] Add `.toolbar-row .search-box { width: 280px }` to sub-menu-group.scss
- [x] Add `.master-tabs .search-box { width: 280px }` to masters.scss
- [x] Verify build (running)
