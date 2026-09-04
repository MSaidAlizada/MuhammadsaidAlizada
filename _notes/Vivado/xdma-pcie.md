---
layout: note
title: "XDMA and PCIe"
date: 2025-05-13
---
## What is BAR?
- BAR => Base Address Register
- It is a small register located on the PCIe card
- During boot:
    1. BIOS walks PCIe bus and finds every card
    2. For each card it reads how many BARs the card has and how big each BAR wants to be
    3. BIOS finds free space in the CPU's physicall address map and writes starting address into each BAR
    4. When CPU accesses an address in that range the chipset routes it to that card
- Host sees physical address while the card sees offsets from within its own BAR

## What is XDMA?
- XDMA is a Xilinx IP which handles the PCIe protocol
- It exposes 3 BARs which connects to different AXI master interfaces
    1. DMA BAR => Drives M_AXI
    2. AXI-lite BAR => Drives M_AXI_LITE
    3. Bypass BAR => Drives M_AXI_Bypass
- Host writes to BAR Addr + Offset and FPGA M_AXI will see Offset
- In Linux the driver provides a file /dev/xdma0_h2c_0 where the file offset = AXI Address so writing to that file is like doing a memory write to that address
- For AXI-Lite that file is /dev/xdma0_user, as for AXI-Lite there is another parameter which is translation offset
    - Translation offset allows you shift where the BAR window sits for example if your translation offset is 0x40000000 then with host offset 0x100 the FPGA will write to 0x40000100
    - This allows small BARs to be able to reach slaves that have high FPGA addresses without wasting host address space

