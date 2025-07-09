/**
 * The definitive default list of product templates to be seeded for a new tenant.
 * The `*Name` fields are used by the seeder to look up the correct ObjectId.
 * Ordered by latest Apple products first, containing over 100 templates.
 */
const PRODUCT_TEMPLATE_MASTER_LIST = [
  {
    baseName: "20w Usb-c 3-pin Power Adapter",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Chargers & Cables",
    attributeSetName: "Charger Specifications",
    images: [
      {
        url: "https://i0.wp.com/www.innovink.lk/wp-content/uploads/2023/11/Apple-20W-USB-Type-C-Power-Adapter.jpg?resize=300%2C300&ssl=1",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Usb-c To Lightning Cable - 1m",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://celltronics.lk/wp-content/uploads/2022/11/Apple-USB-C-to-Lightning-Cable-1.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Lightning To Usb Cable - 1m",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://carmarthencameras.com/cdn/shop/products/3_67_12.jpg?v=1654869539",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Usb Power Adapter 5w",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Chargers & Cables",
    attributeSetName: "Charger Specifications",
    images: [
      {
        url: "https://mcprod.hnak.com/media/catalog/product/5/2/52a1cb63976bed376f7f7a333a1a203fcc567a3d1274c17fa5e1cd93adcad53f.jpeg?quality=60&fit=bounds&height=&width=",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A620 Tws Earbuds Pro 2",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://otc.lk/wp-content/uploads/2024/08/Aspor-A620-TWS-Earbuds-Pro-2-BY-OTC.LK-IN-SRILANKA-1.png",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A827 Advanced Micro / V8 Fast Charger Iq 2.4a",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Charger Specifications",
    images: [
      {
        url: "https://static-01.daraz.lk/p/78a1bc6f574db83a3fcd4caa4aeb37e5.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A167 Fast Charging Usb To Lightning Cable",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://appleme.lk/wp-content/uploads/2023/07/1-207.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A168 Fast Charging Usb To Type-c Cable",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://i0.wp.com/cyberdeals.lk/wp-content/uploads/2024/09/1-208.jpg?fit=600%2C600&ssl=1",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A166 Fast Charging Usb To Micro Cable",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://i0.wp.com/appleme.lk/wp-content/uploads/2023/07/1-206.jpg?fit=600%2C600&ssl=1",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A109pd 27w Type-c To Lightning Fast Charging Cable",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://macs.lk/wp-content/uploads/2024/08/16cda90ef8b834e733c289346e20a112.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A152 Type-c To Type-c 100w Pd Fast Charging Cable 1.8m",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://jomlakwt.s3.me-south-1.amazonaws.com/uploads/all/2XbELZsWlYxToSvAO7FtORurVRffImRfxYJWgZC9.webp.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "D60l 2.4 Lightning Chargering Data Cable",
    type: "non-serialized",
    brandName: "VDENMENV",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://gpbest.by/upload/iblock/f46/f463311dd0cd77301e00f770353a95b8.png",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Housing Iphone 12 Pro Pacific Blue",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Frame & Housing",
    attributeSetName: "Spare Parts (Mobiles)",
    images: [
      {
        url: "https://m.media-amazon.com/images/I/41-F8Y7VPRL._AC_UF894,1000_QL80_.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Dc01y 3pin Dock",
    type: "non-serialized",
    brandName: "VDENMENV",
    categoryName: "Chargers & Cables",
    attributeSetName: "Charger Specifications",
    images: [
      {
        url: "https://otc.lk/wp-content/uploads/2024/04/Vdenmenv-DC01Y-3pin-Dock-BY-OTC.LK-IN-SRILANKA-1.png",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Airpods Pro 2nd Generation",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://staticcontent.eways.ir/upload/ProductPictures/991386ex6681827183.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A9 Pro Touch Screen Airpods_pro – Anc Wireless Earbuds With Bluetooth 5.0",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://static-01.daraz.pk/p/b8106345399b9a44bc61ad558c49337a.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "G28 Earphones Comfortable",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://img.tvcmall.com/dynamic/uploads/details/740x740_681500376A-7.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "G25 3.5mm Earphone",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://otc.lk/wp-content/uploads/2024/04/Celebrat-G25-3.5mm-Earphone-by-otc.lk-in-srilanka-.png",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "D11 Wired Earphone 3.5mm",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://fonehouse.lk/wp-content/uploads/2024/08/D11-packaging-image-300x300-1.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "G19 Wired Headphones 3.5mm Stereo Sound In-ear Earphone",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://transasia.lk/img/product/11600/11600-002_720X720.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Fly-1 Effortless Joyful Sound 3.5mm",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://b2b.miami/content/images/37/naushniki-celebrat-fly-1-black-54892654355215.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A330 Powerbank 10000 Mah",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://gadgetasia.lk/wp-content/uploads/2024/09/sri-lanka-gadget-asia-lk-aspor-a330-10000mah-powerbank-best-price.png",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A316 20000mah 22.5w Portable Power Bank",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://www.simplytek.lk/cdn/shop/files/Aspor-A316-20000mAh-Portable-Power-Bank-simplytek-lk-Sri-Lanka_2.jpg?v=1698992724&width=610",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Tune 110 – Original Wired Handsfree",
    type: "non-serialized",
    brandName: "JBL",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://shopperstar.lk/wp-content/uploads/2022/08/JBL-TUNE-110-2.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Protective Case",
    type: "non-serialized",
    brandName: "UNIQUE DESIGN",
    categoryName: "Phone Cases",
    attributeSetName: "Phone Case Specifications",
    images: [
      {
        url: "https://5.imimg.com/data5/SELLER/Default/2023/5/310429371/WZ/JZ/DM/189434614/black-airpods-pro-protective-case-500x500.jpeg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Display",
    type: "non-serialized",
    brandName: "GX",
    categoryName: "Display Screens",
    attributeSetName: "Display Screen Specs",
    images: [
      {
        url: "https://s.alicdn.com/@sc04/kf/Ha06ca052a7534b8c9051fc2cb07189e0G.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Battery",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Batteries",
    attributeSetName: "Battery Specs",
    images: [
      {
        url: "https://www.phonepartworld.com/image/cache/data/Products/iPhone%206/11-Apple-iPhone-6-Battery-Replacement-1-700x600.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Backglass",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Glass & Lens",
    attributeSetName: "Back Glass Specs",
    images: [
      {
        url: "https://www.mbitechparts.ie/wp-content/uploads/2018/01/iPhone-X-10-Adhesive-Inc-Gold-Replacement-Back-Rear-Glass-Battery-Cover-White.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Oca Touch Glass",
    type: "non-serialized",
    brandName: "G+OCA PRO",
    categoryName: "Glass & Lens",
    attributeSetName: "Display Screen Specs",
    images: [
      {
        url: "https://s.alicdn.com/@sc04/kf/Hb94aef3c15b44729ba4c87047585aac8H.jpg_720x720q50.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A616 True Wireless Stereo Bluetooth Earbuds",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Headphones & Earbuds",
    attributeSetName: "Earphones / Headphones",
    images: [
      {
        url: "https://lafafa.pk/wp-content/uploads/2022/04/10-1.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A827 Advanced Type-c / V8 Fast Charger Iq 2.4a",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Charger Specifications",
    images: [
      {
        url: "https://img.drz.lazcdn.com/static/lk/p/78a1bc6f574db83a3fcd4caa4aeb37e5.jpg_720x720q80.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Silicone Case",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Phone Cases",
    attributeSetName: "Apple Case Specs",
    images: [
      {
        url: "https://i0.wp.com/cyberdeals.lk/wp-content/uploads/2024/09/Dark-Blue-1.jpg?fit=600%2C600&ssl=1",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Magsafe Case",
    type: "non-serialized",
    brandName: "Spigen",
    categoryName: "Phone Cases",
    attributeSetName: "Apple Case Specs",
    images: [
      {
        url: "https://nofake.lk/wp-content/uploads/2023/05/IMG_3758-2.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Crystal Case",
    type: "non-serialized",
    brandName: "Crystal Case",
    categoryName: "Phone Cases",
    attributeSetName: "Apple Case Specs",
    images: [
      {
        url: "https://thecasefactory.in/cdn/shop/files/TransparentCase-Copy.jpg?v=1737532101&width=1024",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Airpod Pro /02 Leather Case",
    type: "non-serialized",
    brandName: "UNIQUE DESIGN",
    categoryName: "Phone Cases",
    attributeSetName: "Phone Case Specifications",
    images: [
      {
        url: "https://static.tudo.lk/uploads/2023/01/airpod-pro-pouch-synthetic-leather-16731732280215727.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Magsafe Battery Pack",
    type: "non-serialized",
    brandName: "Redington",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://bizweb.dktcdn.net/thumb/grande/100/368/432/products/sac-du-phong-magsafe-battery-3.jpg?v=1720768361793",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Xmart Camera Lens",
    type: "non-serialized",
    brandName: "Xmart",
    categoryName: "Screen Protectors",
    attributeSetName: "Apple Case Specs",
    images: [
      {
        url: "https://5.imimg.com/data5/SELLER/Default/2024/7/438097683/BL/KK/BB/86943673/xmart-mobile-camera-ring.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Air Pods Pro Ati-lost Cace",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Phone Cases",
    attributeSetName: "Phone Case Specifications",
    images: [
      {
        url: "https://i5.walmartimages.com/asr/8cb4dcec-49f8-4bad-a6b5-a894d3e1d5e5.5ccc7ea859c295bfeca29352310de45d.jpeg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Air Pods Pro 2 Ati-lost Cace",
    type: "non-serialized",
    brandName: "ATB KING KONG",
    categoryName: "Phone Cases",
    attributeSetName: "Phone Case Specifications",
    images: [
      {
        url: "https://i5.walmartimages.com/asr/8cb4dcec-49f8-4bad-a6b5-a894d3e1d5e5.5ccc7ea859c295bfeca29352310de45d.jpeg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A325 Wireless Power Bank 5000mah",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://baloon.lk/wp-content/uploads/2023/11/450x450-Web-Site-SIZE-1-1-300x300.png",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Usb-a To Micro (cb-24m)",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://www.data-media.gr/i/289122/CB-24M-2.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Usb-a To Lightning (cb-24l)",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://www.data-media.gr/i/289119/CB-24L-2.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Usb-a To Tp-c (cb-24c)",
    type: "non-serialized",
    brandName: "CELEBRATE",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://www.data-media.gr/i/289124/CB-24C-2.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Apple Iphone 8 256gb Space Grey Black",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [
      {
        url: "https://mobilecity-live.s3.ap-southeast-2.amazonaws.com/wp-content/uploads/2021/01/01011348/iPhone-8-black.jpeg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Apple Iphone 8 64gb Space Grey Black",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [
      {
        url: "",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Iphone Orgin",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Batteries",
    attributeSetName: "Battery Specs",
    images: [
      {
        url: "https://appleme.lk/wp-content/uploads/2023/03/6-battery.jpeg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Recci Rpb-n17 Burton 2.1a 20000 Mah Power Bank (black)",
    type: "non-serialized",
    brandName: "RECCI",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://otc.lk/wp-content/uploads/2024/11/recci-2.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A322 10000 Mah Power Bank",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://img.drz.lazcdn.com/static/lk/p/dd14b23e602c351d59a7306a2af5c192.jpg_960x960q80.jpg_.webp",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A827 Advanced Lihgtning/ V8 Fast Charger Iq 2.4a",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Charger Specifications",
    images: [
      {
        url: "https://static-01.daraz.lk/p/78a1bc6f574db83a3fcd4caa4aeb37e5.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Atb-king Kong Glass Clear",
    type: "non-serialized",
    brandName: "ATB KING KONG",
    categoryName: "Screen Protectors",
    attributeSetName: "Apple Case Specs",
    images: [
      {
        url: "https://down-my.img.susercontent.com/file/my-11134207-7r98w-lzzb39uy04mh3c",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Ac-25 3.1a Fast Charge Micro Usb Data & Charging 1m",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Chargers & Cables",
    attributeSetName: "Cable Specs",
    images: [
      {
        url: "https://static-01.daraz.lk/p/84a0c68cd5859ea21678f34b7947d9b3.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "A371 10000mah Powerbank",
    type: "non-serialized",
    brandName: "ASPOR",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [
      {
        url: "https://otc.lk/wp-content/uploads/2024/12/Aspor-A371-10000mAH-Power-Bank-by-otc.lk-in-srilanka-scaled.jpg",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  //======================================================================
  // iPhones (Latest to Oldest)
  //======================================================================
  {
    baseName: "iPhone 16 Pro",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [{ url: "https://i.imgur.com/p24x9aO.png" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 16 Pro Max",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [{ url: "https://i.imgur.com/p24x9aO.png" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 16",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [{ url: "https://i.imgur.com/jIUiLd2.png" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 16 Plus",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [{ url: "https://i.imgur.com/jIUiLd2.png" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 15 Pro",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846363993",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 15 Pro Max",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-whitetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846363459",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 15",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692923783938",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 15 Plus",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-green?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692923778929",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 14 Pro",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1663703891093",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 14",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-yellow?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1661023finish-select-202209-6-1inch-yellow",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone 13",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-6-1inch-green?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=16567128882finish-select-202207-6-1inch-green",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPhone SE (3rd generation)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smartphones",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-finish-select-202207-starlight?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1656712 finish-select-202207-starlight",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // iPads (Latest to Oldest)
  //======================================================================
  {
    baseName: "iPad Pro 13-inch (M4)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Tablets & iPads",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-m4-select-wifi-spaceblack-202405?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1713488291242",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPad Air 13-inch (M2)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Tablets & iPads",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-13-m2-select-wifi-purple-202405?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=171348827purple-202405",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPad (10th generation)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Tablets & iPads",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-10-9-finish-select-202212-blue?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1667610509373",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "iPad mini (6th generation)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Tablets & iPads",
    attributeSetName: "Apple iPhone Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-mini-finish-select-gallery-202211-starlight?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1667595932822",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // MacBooks (Latest to Oldest)
  //======================================================================
  {
    baseName: "MacBook Air 15-inch (M3)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Laptops & MacBooks",
    attributeSetName: "Apple MacBook Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-select-202402?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1707099711652",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "MacBook Air 13-inch (M3)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Laptops & MacBooks",
    attributeSetName: "Apple MacBook Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-starlight-select-202402?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1707099711652",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "MacBook Pro 14-inch (M3)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Laptops & MacBooks",
    attributeSetName: "Apple MacBook Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-m3-max-pro-spaceblack-select-202310?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830118",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "MacBook Pro 16-inch (M3)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Laptops & MacBooks",
    attributeSetName: "Apple MacBook Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-m3-max-pro-silver-select-202310?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830118",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Apple Watch (Latest to Oldest)
  //======================================================================
  {
    baseName: "Apple Watch Ultra 2",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smart Watches",
    attributeSetName: "Apple Watch Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra2-digital-crown-202309_GEO_US?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=16941242502",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Apple Watch Series 9",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smart Watches",
    attributeSetName: "Apple Watch Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-digital-crown-202309_GEO_US?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1694124376785",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Apple Watch SE",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Smart Watches",
    attributeSetName: "Apple Watch Specs",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-se-digital-crown-202309?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=16941242502",
      },
    ],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Samsung Phones
  //======================================================================
  {
    baseName: "Samsung Galaxy S24 Ultra",
    type: "serialized",
    brandName: "Samsung",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [{ url: "https://i.imgur.com/8MrZ9pD.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Samsung Galaxy Z Fold 5",
    type: "serialized",
    brandName: "Samsung",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [{ url: "https://i.imgur.com/6Xz1Y2b.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Samsung Galaxy A55",
    type: "serialized",
    brandName: "Samsung",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [{ url: "https://i.imgur.com/gTq42K0.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Other Android Phones
  //======================================================================
  {
    baseName: "Google Pixel 8 Pro",
    type: "serialized",
    brandName: "Google",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [{ url: "https://i.imgur.com/2Y5lG1f.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Xiaomi 14 Ultra",
    type: "serialized",
    brandName: "Xiaomi",
    categoryName: "Smartphones",
    attributeSetName: "Smartphone Specifications",
    images: [{ url: "https://i.imgur.com/5D6fBq4.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Cases & Covers (Extensive List)
  //======================================================================
  ...["15 Pro Max", "15 Pro", "15 Plus", "15", "14 Pro", "14"].map((model) => ({
    baseName: `Spigen Liquid Air Case for iPhone ${model}`,
    type: "non-serialized",
    brandName: "Spigen",
    categoryName: "Cases & Covers",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/bK6g3pW.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),

  ...["S24 Ultra", "S24", "S23 Ultra"].map((model) => ({
    baseName: `Nillkin CamShield Pro Case for Samsung ${model}`,
    type: "non-serialized",
    brandName: "Nillkin",
    categoryName: "Cases & Covers",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/mZ4R2j5.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),

  ...["15 Pro", "15", "14", "13"].map((model) => ({
    baseName: `Apple Silicone Case with MagSafe for iPhone ${model}`,
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Cases & Covers",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/J3Gf1Gv.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  {
    baseName: "Generic Clear TPU Case",
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Cases & Covers",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/h5r8wFf.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Screen Protectors
  //======================================================================

  ...["S24 Ultra", "S24", "S23 Ultra", "A55"].map((model) => ({
    baseName: `Privacy Tempered Glass for Samsung ${model}`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Screen Protectors",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/J4p7F3g.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),

  //======================================================================
  // Chargers & Adapters
  //======================================================================
  {
    baseName: "Apple 20W USB-C Power Adapter",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Chargers & Adapters",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/s6n5Y6T.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Anker 30W Nano 3 Charger (GaN)",
    type: "non-serialized",
    brandName: "Anker",
    categoryName: "Chargers & Adapters",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/lJ4d9Yd.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Baseus 65W GaN3 Pro Desktop Charger",
    type: "non-serialized",
    brandName: "Baseus",
    categoryName: "Chargers & Adapters",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/GfJj2m3.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Ugreen 100W Nexode GaN Charger",
    type: "non-serialized",
    brandName: "Ugreen",
    categoryName: "Chargers & Adapters",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/v8t4R3p.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Cables & Converters
  //======================================================================
  {
    baseName: "Apple USB-C to Lightning Cable",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Cables & Converters",
    attributeSetName: "Cable Specifications",
    images: [{ url: "https://i.imgur.com/o7s2q2Y.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Apple USB-C Charge Cable",
    type: "non-serialized",
    brandName: "Apple",
    categoryName: "Cables & Converters",
    attributeSetName: "Cable Specifications",
    images: [{ url: "https://i.imgur.com/O6hJ3b5.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Anker PowerLine III USB-C to USB-C",
    type: "non-serialized",
    brandName: "Anker",
    categoryName: "Cables & Converters",
    attributeSetName: "Cable Specifications",
    images: [{ url: "https://i.imgur.com/r8t2Y3z.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Baseus 3-in-1 Charging Cable",
    type: "non-serialized",
    brandName: "Baseus",
    categoryName: "Cables & Converters",
    attributeSetName: "Cable Specifications",
    images: [{ url: "https://i.imgur.com/yB2f0G2.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Ugreen HDMI to VGA Converter",
    type: "non-serialized",
    brandName: "Ugreen",
    categoryName: "Cables & Converters",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/d9jY8hV.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Power Banks
  //======================================================================
  {
    baseName: "Anker PowerCore 10000mAh",
    type: "non-serialized",
    brandName: "Anker",
    categoryName: "Power Banks",
    attributeSetName: "Power Bank Specifications",
    images: [{ url: "https://i.imgur.com/L2q8sJ7.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Anker 737 Power Bank (PowerCore 24K)",
    type: "non-serialized",
    brandName: "Anker",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/eG1f0W8.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Baseus 20000mAh 65W Power Bank",
    type: "non-serialized",
    brandName: "Baseus",
    categoryName: "Power Banks",
    attributeSetName: "Power Bank Specifications",
    images: [{ url: "https://i.imgur.com/T5r7m2X.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Remax 50000mAh Power Bank",
    type: "non-serialized",
    brandName: "Remax",
    categoryName: "Power Banks",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/3N8p8Wk.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Audio
  //======================================================================
  {
    baseName: "Apple AirPods Pro (2nd generation)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Earphones",
    attributeSetName: "Audio Accessory Specs", // ✅ New set
    images: [{ url: "https://i.imgur.com/9n9L9kL.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Apple AirPods (3rd generation)",
    type: "serialized",
    brandName: "Apple",
    categoryName: "Earphones",
    attributeSetName: "Audio Accessory Specs", // ✅ Same set
    images: [{ url: "https://i.imgur.com/bX6f6l7.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "JBL Go 3 Portable Speaker",
    type: "serialized",
    brandName: "JBL",
    categoryName: "Bluetooth Speakers",
    attributeSetName: "Speaker Specifications", // ✅ Corrected
    images: [{ url: "https://i.imgur.com/XqY8X8z.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Sony WH-1000XM5 Headphones",
    type: "serialized",
    brandName: "Sony",
    categoryName: "Headphones & Headsets",
    attributeSetName: "Audio Accessory Specs", // ✅ Same set as AirPods
    images: [{ url: "https://i.imgur.com/R3r3p8Z.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // Storage
  //======================================================================
  {
    baseName: "SanDisk Ultra microSD Card",
    type: "non-serialized",
    brandName: "SanDisk",
    categoryName: "Memory Cards & Storage",
    attributeSetName: "Storage",
    images: [{ url: "https://i.imgur.com/sT5w1d3.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Kingston DataTraveler USB 3.2 Flash Drive",
    type: "non-serialized",
    brandName: "Kingston",
    categoryName: "Memory Cards & Storage",
    attributeSetName: "Storage",
    images: [{ url: "https://i.imgur.com/j1v2X4D.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // EXPANDED Accessories Section
  //======================================================================
  // --- Cases & Covers ---
  ...["15 Pro Max", "15 Pro", "15 Plus", "15", "14 Pro", "14", "13", "SE"].map((model) => ({
    baseName: `Spigen Liquid Air Case for iPhone ${model}`,
    type: "non-serialized",
    brandName: "Spigen",
    categoryName: "Cases & Covers",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/bK6g3pW.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["S24 Ultra", "S24", "S23 Ultra", "A55", "A35"].map((model) => ({
    baseName: `Nillkin CamShield Pro Case for Samsung ${model}`,
    type: "non-serialized",
    brandName: "Nillkin",
    categoryName: "Cases & Covers",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/mZ4R2j5.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  {
    baseName: "Otterbox Defender Series Case for iPhone 15 Pro",
    type: "non-serialized",
    brandName: "Otterbox",
    categoryName: "Cases & Covers",
    attributeSetName: "Phone Case Attributes",
    images: [{ url: "https://i.imgur.com/N8gZ6hF.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  // --- Screen Protectors ---
  ...["15 Pro Max", "15 Pro", "15 Plus", "15", "14 Pro", "14", "13", "SE", "12"].map((model) => ({
    baseName: `9H Tempered Glass for iPhone ${model}`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Screen Protectors",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/z4bY3hX.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["S24 Ultra", "S24", "S23 Ultra", "A55", "A35"].map((model) => ({
    baseName: `Matte Finish Tempered Glass for Samsung ${model}`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Screen Protectors",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/S8h7J2K.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  {
    baseName: "Camera Lens Protector for iPhone 15 Pro/Pro Max",
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Screen Protectors",
    attributeSetName: null,
    images: [{ url: "https://i.imgur.com/2s4xYgM.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // DEFINITIVE Repair Parts Section
  //======================================================================
  ...["15 Pro Max", "15 Pro", "14 Pro Max", "14 Pro", "13 Pro Max", "13 Pro", "12", "11"].map(
    (model) => ({
      baseName: `iPhone ${model} Display Assembly (OEM)`,
      type: "serialized",
      brandName: "Apple",
      categoryName: "Displays",
      attributeSetName: "Display Attributes",
      images: [{ url: "https://i.imgur.com/o1C3g9w.jpeg" }],
      assetAccountName: "Inventory Asset",
      revenueAccountName: "Sales Revenue",
      cogsAccountName: "Cost of Goods Sold",
    })
  ),
  ...["S24 Ultra", "S23 Ultra", "S22 Ultra"].map((model) => ({
    baseName: `Samsung ${model} Display Assembly (AMOLED)`,
    type: "serialized",
    brandName: "Samsung",
    categoryName: "Displays",
    attributeSetName: "Display Attributes",
    images: [{ url: "https://i.imgur.com/7gK8L4b.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),

  ...["15 Pro", "14 Pro", "13", "12", "11", "XS", "X"].map((model) => ({
    baseName: `iPhone ${model} Battery`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Batteries",
    attributeSetName: "Battery Specs",
    images: [{ url: "https://i.imgur.com/C3b1b6B.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["15 Pro", "14", "13", "12"].map((model) => ({
    baseName: `iPhone ${model} Charging Port Flex Cable`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Flex Cables",
    attributeSetName: "Flex Cable Attributes",
    images: [{ url: "https://i.imgur.com/N2s1f2y.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["15 Pro Max", "15 Pro", "14 Pro Max", "14 Pro"].map((model) => ({
    baseName: `iPhone ${model} Back Glass with Housing`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Housing & Chassis",
    attributeSetName: "Housing Attributes",
    images: [{ url: "https://i.imgur.com/D9fV6j1.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  {
    baseName: `iPhone Face ID / Proximity Sensor Flex`,
    type: "non-serialized",
    brandName: "Unbranded",
    categoryName: "Flex Cables",
    attributeSetName: "Flex Cable Attributes",
    images: [{ url: "https://i.imgur.com/b9J8K5A.jpeg" }],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  //======================================================================
  // DEFINITIVE Services Section
  //======================================================================
  // --- Diagnostics ---
  {
    baseName: "Standard Diagnostic Service",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Standard Diagnostic Service",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Advanced Liquid Damage Assessment",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Liquid Damage Assessment",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  // --- Common Hardware Repairs ---
  ...["15 Pro", "15", "14 Pro", "14", "13", "12", "11"].map((model) => ({
    baseName: `iPhone ${model} Screen Replacement (Original Quality)`,
    type: "service",
    brandName: "Unbranded",
    categoryName: "Screen Replacement",
    attributeSetName: "Service Attributes",
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["S23 Ultra", "S22", "A54"].map((model) => ({
    baseName: `Samsung ${model} Screen Replacement`,
    type: "service",
    brandName: "Unbranded",
    categoryName: "Screen Replacement",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["14 Pro", "13", "12", "11", "XS", "X"].map((model) => ({
    baseName: `iPhone ${model} Battery Replacement`,
    type: "service",
    brandName: "Unbranded",
    categoryName: "Battery Replacement",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["14 Pro", "13", "12"].map((model) => ({
    baseName: `iPhone ${model} Charging Port Replacement`,
    type: "service",
    brandName: "Unbranded",
    categoryName: "Charging Port Replacement",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  ...["14 Pro", "13"].map((model) => ({
    baseName: `iPhone ${model} Back Glass Replacement`,
    type: "service",
    brandName: "Unbranded",
    categoryName: "Back Glass Repair",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  })),
  {
    baseName: "Speaker / Earpiece Cleaning",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Speaker/Mic Repair",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  // --- Advanced / Motherboard Repairs ---
  {
    baseName: "No Power - Short Circuit Diagnostic & Repair",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Laptop Repair",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Charging IC Replacement",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Laptop Repair",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Audio IC Replacement",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Laptop Repair",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Liquid Damage Ultrasonic Cleaning",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Ultrasonic Cleaning",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "MacBook Logic Board Repair (Level 3)",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Laptop Repair",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },

  // --- Software Services ---
  {
    baseName: "iOS Update & Backup Service",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Software Installation",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Data Transfer (Phone to Phone)",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Software Installation",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
  {
    baseName: "Password / Lock Removal (Proof of Ownership Req.)",
    type: "service",
    brandName: "Unbranded",
    categoryName: "Software Installation",
    attributeSetName: null,
    images: [],
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  },
];

module.exports = PRODUCT_TEMPLATE_MASTER_LIST;
