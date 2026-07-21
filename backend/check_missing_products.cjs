const slugs = [
    "fx-tb400",
    "500w-micro-inverter",
    "600w-micro-inverter-2",
    "800w-micro-inverter-2",
    "1000w-micro-inverter",
    "1600w-micro-inverter-2",
    "1800w-micro-inverter",
    "2000w-micro-inverter-2",
    "2400w-micro-inverter",
    "300w-micro-inverter",
    "350w-micro-inverter",
    "400w-micro-inverter",
    "600w-micro-inverter",
    "700w-micro-inverter",
    "1200w-micro-inverter",
    "1400w-micro-inverter",
    "1600w-micro-inverter",
    "2000w-micro-inverter"
];

async function main() {
    const existing = [];
    const missing = [];
    
    for (const slug of slugs) {
        try {
            const res = await fetch(`http://localhost:3001/api/content?slug=product/${slug}`);
            const data = await res.json();
            if (data && data.type === 'product') {
                existing.push(slug);
            } else {
                missing.push(slug);
            }
        } catch (err) {
            missing.push(slug);
        }
    }
    
    console.log("Existing:");
    console.log(existing.join('\n'));
    console.log("Missing:");
    console.log(missing.join('\n'));
}

main().catch(console.error);
