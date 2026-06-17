import React from "react";
// @ts-ignore: CSS module import without type declarations
import "./Editorial.css";

interface EditorialMember {
  id: string;
  name: string;
  role: string;
  description: string;
}

const Editorial: React.FC = () => {
  // 4 zupełnie różne osoby w komitecie redakcyjnym
  const members: EditorialMember[] = [
    {
      id: "1",
      name: "Prof. dr hab. Janusz Kowalski",
      role: "Redaktor Naczelny",
      description:
        "Specjalizuje się w analizie matematycznej i równaniach różniczkowych. Autor ponad stu publikacji naukowych oraz wieloletni wykładowca akademicki pasjonujący się popularyzacją królowej nauk.",
    },
    {
      id: "2",
      name: "Dr inż. Anna Malewska",
      role: "Zastępca Redaktora Naczelnego",
      description:
        "Jej zainteresowania badawcze skupiają się wokół algorytmiki, sztucznej inteligencji oraz uczenia maszynowego. Odpowiada za sekcję artykułów związanych z informatyką teoretyczną i stosowaną.",
    },
    {
      id: "3",
      name: "Dr hab. Elżbieta Nowak",
      role: "Sekretarz Redakcji",
      description:
        "Ekspert w dziedzinie dydaktyki matematyki oraz nowoczesnych metod nauczania. Koordynuje proces wydawniczy, dba o kontakt z recenzentami i czuwa nad rzetelnością merytoryczną każdego numeru.",
    },
    {
      id: "4",
      name: "Dr Mariusz Wiśniewski",
      role: "Redaktor Tematyczny",
      description:
        "Zajmuje się historią nauki oraz szeroko pojętą popularyzacją wiedzy. W redakcji opiekuje się działem artykułów popularnonaukowych, dbając o ich przystępną i angażującą formę.",
    },
  ];

  // Ulepszona funkcja wyciągająca inicjały (ignoruje tytuły naukowe jak Prof, dr, hab, inż)
  const getInitials = (name: string) => {
    if (!name) return "";
    const cleanName = name.replace(/(prof\.|dr|hab\.|inż\.)/gi, "").trim();

    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="ed-container">
      <div className="ed-header">
        <h1 className="ed-title">Redakcja</h1>
        <div className="ed-title-underline"></div>
      </div>

      <p className="ed-intro">
        Strona prezentuje skład komitetu redakcyjnego czasopisma, skupiając
        uznanych specjalistów i ekspertów z różnych dziedzin. Grono redakcyjne
        zapewnia wysoki poziom merytoryczny publikowanych treści oraz dba o ich
        rzetelność i jakość naukową. Dzięki doświadczeniu i zaangażowaniu
        redaktorów, czasopismo utrzymuje prestiżowy charakter i wysoki standard
        publikacji. Komitet redakcyjny czuwa nad procesem recenzyjnym oraz
        rozwojem pisma.
      </p>

      <div className="ed-grid">
        {members.map((member) => (
          <div key={member.id} className="ed-card">
            <div className="ed-avatar">
              <span className="ed-avatar-text">{getInitials(member.name)}</span>
            </div>
            <div className="ed-info">
              <h2 className="ed-member-name">{member.name}</h2>
              <h3 className="ed-member-role">{member.role}</h3>
              <p className="ed-member-desc">{member.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Editorial;
