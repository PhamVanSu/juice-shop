const juiceData = [
  // --- NHÓM NƯỚC ÉP ĐƠN (SINGLE) ---
  {
    title: "Nước ép cam",
    name: "Cam",
    name_en: "Orange",
    price: 30000,
    type: "single",
    image: "/images/products/orange.png",
    sub_title: "Tươi ngon – giàu Vitamin C – tăng cường sức khỏe",
    description: "Nước ép cam nguyên chất được làm từ những quả cam tươi ngon, giàu Vitamin C, giúp tăng cường hệ miễn dịch, làm đẹp da và bổ sung năng lượng tự nhiên cho cơ thể.",
    ingredient: "100% cam tươi ép lạnh, không chất bảo quản, không đường hóa học.",
    nutrition: "Vitamin C, Kali, Folate, chất chống oxy hóa"
  },
  {
    title: "Nước ép dưa hấu",
    name: "Dưa hấu",
    name_en: "Watermelon",
    price: 25000,
    type: "single",
    image: "/images/products/watermelon.png",
    sub_title: "Ngọt thanh – Giải nhiệt mùa hè",
    description: "Vị ngọt tự nhiên từ dưa hấu giúp bù nước tức thì và làm mát cơ thể.",
    ingredient: "100% dưa hấu đỏ tươi.",
    nutrition: "Vitamin A, C, Lycopene"
  },
  {
    title: "Nước ép dứa",
    name: "Dứa",
    name_en: "Pineapple",
    price: 35000,
    type: "single",
    image: "/images/products/pineapple.png",
    sub_title: "Hương vị nhiệt đới – Hỗ trợ tiêu hóa",
    description: "Nước ép dứa thơm lừng, hỗ trợ quá trình trao đổi chất và tiêu hóa tốt hơn.",
    ingredient: "Dứa mật chín cây.",
    nutrition: "Bromelain, Vitamin C, Manganese"
  },
  {
    title: "Nước ép cóc",
    name: "Cóc",
    name_en: "Ambarella",
    price: 30000,
    type: "single",
    image: "/images/products/ambarella.png",
    sub_title: "Chua thanh – Kích thích vị giác",
    description: "Giàu vitamin giúp tăng cường sức đề kháng và giải cảm hiệu quả.",
    ingredient: "Cóc tươi chọn lọc.",
    nutrition: "Vitamin C, Sắt, Canxi"
  },
  {
    title: "Nước ép ổi",
    name: "Ổi",
    name_en: "Guava",
    price: 25000,
    type: "single",
    image: "/images/products/guava.png",
    sub_title: "Ít đường – Giàu chất xơ",
    description: "Lựa chọn tuyệt vời cho người ăn kiêng và muốn duy trì làn da khỏe mạnh.",
    ingredient: "Ổi xá lị tươi.",
    nutrition: "Vitamin A, C, Chất xơ"
  },
  {
    title: "Nước ép táo",
    name: "Táo",
    name_en: "Apple",
    price: 35000,
    type: "single",
    image: "/images/products/apple.png",
    sub_title: "Ngọt dịu – Tốt cho tim mạch",
    description: "Hương vị táo đỏ thơm ngon, giúp làm sạch cơ thể và giảm cholesterol.",
    ingredient: "Táo Envy hoặc táo đỏ nhập khẩu.",
    nutrition: "Quercetin, Kali, Vitamin C"
  },
  {
    title: "Nước ép cà rốt",
    name: "Cà rốt",
    name_en: "Carrot",
    price: 30000,
    type: "single",
    image: "/images/products/carrot.png",
    sub_title: "Sáng mắt – Đẹp da",
    description: "Cung cấp hàm lượng Beta-carotene cực cao giúp đôi mắt sáng khỏe.",
    ingredient: "Cà rốt Đà Lạt tươi sạch.",
    nutrition: "Beta-carotene, Vitamin K1, Kali"
  },

  // --- NHÓM NƯỚC ÉP MIX (MIXED) ---
  {
    title: "Nước ép cam dứa",
    name: "Cam dứa",
    name_en: "Orange Pineapple",
    price: 30000,
    type: "mix",
    image: "/images/products/orange-pineapple.png",
    sub_title: "Sự kết hợp bùng nổ hương vị",
    description: "Vị chua của cam hòa quyện với vị thơm ngọt của dứa tạo nên thức uống khó cưỡng.",
    ingredient: "Cam sành và dứa mật.",
    nutrition: "Vitamin C, Bromelain"
  },
  {
    title: "Nước ép cam cà rốt",
    name: "Cam cà rốt",
    name_en: "Orange Carrot",
    price: 25000,
    type: "mix",
    image: "/images/products/orange-carrot.png",
    sub_title: "Thanh lọc và tái tạo năng lượng",
    description: "Sự kết hợp hoàn hảo giúp thải độc gan và làm sáng da từ bên trong.",
    ingredient: "Cam tươi và cà rốt Đà Lạt.",
    nutrition: "Vitamin C, Vitamin A"
  },
  {
    title: "Nước ép cóc ổi",
    name: "Cóc ổi",
    name_en: "Ambarella Guava",
    price: 35000,
    type: "mix",
    image: "/images/products/ambarella-guava.png",
    sub_title: "Vị chua đặc trưng – Giàu chất xơ",
    description: "Thức uống tuyệt vời cho hệ tiêu hóa và tăng cường sức đề kháng.",
    ingredient: "Cóc và ổi tươi.",
    nutrition: "Vitamin C, Chất xơ"
  },
  {
    title: "Nước ép cóc dứa",
    name: "Cóc dứa",
    name_en: "Ambarella Pineapple",
    price: 30000,
    type: "mix",
    image: "/images/products/ambarella-pineapple.png",
    sub_title: "Hương vị lạ miệng – Hấp dẫn",
    description: "Sự kết hợp giữa dứa ngọt và cóc chua thanh.",
    ingredient: "Cóc xanh và dứa chín.",
    nutrition: "Sắt, Vitamin C"
  },
  {
    title: "Nước ép cóc táo",
    name: "Cóc táo",
    name_en: "Ambarella Apple",
    price: 25000,
    type: "mix",
    image: "/images/products/ambarella-apple.png",
    sub_title: "Cân bằng vị giác",
    description: "Vị chua của cóc được làm dịu bởi vị ngọt tinh tế của táo.",
    ingredient: "Cóc và táo đỏ.",
    nutrition: "Chống oxy hóa, Kali"
  },
  {
    title: "Nước ép dứa táo",
    name: "Dứa táo",
    name_en: "Pineapple Apple",
    price: 25000,
    type: "mix",
    image: "/images/products/pineapple-apple.png",
    sub_title: "Ngọt thơm tự nhiên",
    description: "Sự kết hợp giữa hai loại trái cây giàu vitamin hàng đầu.",
    ingredient: "Dứa mật và táo nhập khẩu.",
    nutrition: "Manganese, Vitamin C"
  },
  {
    title: "Nước ép dứa cà rốt",
    name: "Dứa cà rốt",
    name_en: "Pineapple Carrot",
    price: 30000,
    type: "mix",
    image: "/images/products/pineapple-carrot.png",
    sub_title: "Bổ dưỡng – Dễ uống",
    description: "Món mix yêu thích của trẻ em và phụ nữ nhờ vị ngọt thanh và màu sắc bắt mắt.",
    ingredient: "Dứa và cà rốt sạch.",
    nutrition: "Beta-carotene, Bromelain"
  }
];

export default juiceData;