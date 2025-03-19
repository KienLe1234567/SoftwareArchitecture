"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const articles = [
  {
    title: "Cập nhật mới về dịch vụ khám tổng quát",
    date: "19 Mar 2025",
    description: "Bệnh viện vừa nâng cấp gói khám tổng quát với các thiết bị hiện đại, đảm bảo chất lượng chẩn đoán chính xác.",
    imageUrl: "https://i.ibb.co/fM2bq9V/z6267544864718-caf04a0ab4ae130a41a82852880185d9.jpg",
  },
  {
    title: "Khai trương khu điều trị nội trú cao cấp",
    date: "12 Mar 2025",
    description: "Khu nội trú mới với tiện nghi cao cấp, phục vụ tốt nhất cho nhu cầu điều trị và nghỉ ngơi của bệnh nhân.",
    imageUrl: "https://i.ibb.co/fM2bq9V/z6267544864718-caf04a0ab4ae130a41a82852880185d9.jpg",
  },
  {
    title: "Hội thảo chuyên đề về sức khỏe tim mạch",
    date: "05 Mar 2025",
    description: "Hội thảo quy tụ các chuyên gia tim mạch hàng đầu, cập nhật kiến thức mới nhất về chăm sóc và điều trị.",
    imageUrl: "https://i.ibb.co/fM2bq9V/z6267544864718-caf04a0ab4ae130a41a82852880185d9.jpg",
  },
];

export default function HospitalHomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-blue-800">Bệnh Viện Đa Khoa ABC</h1>
        <p className="text-gray-700 max-w-2xl mx-auto pb-6">
          Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao, tận tâm vì sức khỏe cộng đồng.
        </p>
        <Link href="/contact">
          <Button className="px-6 py-2 text-white bg-blue-700 hover:bg-blue-800">
            Liên hệ ngay
          </Button>
        </Link>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Dịch Vụ Nổi Bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-4">
            <CardHeader>
              <CardTitle>Khám tổng quát</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gói khám tổng quát với các chuyên khoa đầy đủ, thiết bị hiện đại, kết quả nhanh chóng.</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardHeader>
              <CardTitle>Phẫu thuật nội soi</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ứng dụng công nghệ phẫu thuật tiên tiến, giảm thiểu đau đớn và thời gian hồi phục.</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardHeader>
              <CardTitle>Chăm sóc sau điều trị</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Dịch vụ chăm sóc tận tình, hỗ trợ bệnh nhân phục hồi sức khỏe nhanh chóng.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tin tức mới nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((article, index) => (
            <Link key={index} href="/news/detail" className="block h-full">
              <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-t-md"
                />
                <CardHeader className="flex-grow">
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                  <p className="text-xs text-gray-500">{article.date}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Link href="/news">
            <Button className="px-6 py-2 text-white bg-blue-700 hover:bg-blue-800">
              Xem thêm tin tức
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
