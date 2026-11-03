Aero S v2.1.10
Dataset-list refresh fix. After Clear data and Clear instance reset the underlying state, both now explicitly run renderList(), the same normal list-render routine used by the Averages only control, then refresh PSD metrics and PSD Correction selectors. v2.1.9 reset/autosave handling and v2.1.8 PSD Correction initialisation/order fixes are retained.
