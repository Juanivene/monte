import { Marquee } from "@/components/ui/Marquee";

const messages = [
  "Envíos a todo el país",
  "Tiradas cortas y numeradas",
  "Cambios dentro de los 30 días",
  "Coordinamos pago y envío por WhatsApp",
  "Hecho en Tucumán",
];

export function AnnouncementBar() {
  return (
    <div className="bg-night text-paper/80">
      <Marquee
        items={messages}
        className="eyebrow py-2.5 text-[0.625rem]"
        speed="42s"
      />
    </div>
  );
}

