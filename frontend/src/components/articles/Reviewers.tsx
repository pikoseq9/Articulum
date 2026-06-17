import React from "react";
// @ts-ignore: CSS module import without type declarations
import "./Reviewers.css";

interface Reviewer {
  id: string;
  name: string;
  field: string;
  description: string;
}

const Reviewers: React.FC = () => {
  // 6 zróżnicowanych recenzentów z podziałem na dziedziny (zgodnie z makietą)
  const reviewers: Reviewer[] = [
    {
      id: "1",
      name: "Prof. dr hab. Andrzej Kowalski",
      field: "Matematyka",
      description:
        "Lorem ipsum dolor sit mentum consectetur velit, et cursus velit egestas quis. Aenean lobortis, nisl ac suscipit egestas, nulla libero mollis erat, vitae egestas odio odio sit amet lacus.",
    },
    {
      id: "2",
      name: "Dr hab. inż. Janusz Malinowski",
      field: "Informatyka",
      description:
        "Lorem ipsum dolor sit mentum consectetur velit, et cursus velit egestas quis. Aenean lobortis, nisl ac suscipit egestas, nulla libero mollis erat, vitae egestas odio odio sit amet lacus.",
    },
    {
      id: "3",
      name: "Dr Barbara Nowak",
      field: "Dydaktyka",
      description:
        "Lorem ipsum dolor sit mentum consectetur velit, et cursus velit egestas quis. Aenean lobortis, nisl ac suscipit egestas, nulla libero mollis erat, vitae egestas odio odio sit amet lacus.",
    },
    {
      id: "4",
      name: "Prof. dr hab. Katarzyna Wiśniewska",
      field: "Popularyzacja nauki",
      description:
        "Lorem ipsum dolor sit mentum consectetur velit, et cursus velit egestas quis. Aenean lobortis, nisl ac suscipit egestas, nulla libero mollis erat, vitae egestas odio odio sit amet lacus.",
    },
    {
      id: "5",
      name: "Dr inż. Michał Zieliński",
      field: "Informatyka",
      description:
        "Lorem ipsum dolor sit mentum consectetur velit, et cursus velit egestas quis. Aenean lobortis, nisl ac suscipit egestas, nulla libero mollis erat, vitae egestas odio odio sit amet lacus.",
    },
    {
      id: "6",
      name: "Dr hab. Alina Mazur",
      field: "Matematyka",
      description:
        "Lorem ipsum dolor sit mentum consectetur velit, et cursus velit egestas quis. Aenean lobortis, nisl ac suscipit egestas, nulla libero mollis erat, vitae egestas odio odio sit amet lacus.",
    },
  ];

  // Czyszczenie tytułów naukowych do inicjałów (np. "Prof. dr hab. Andrzej Kowalski" -> "AK")
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
    <div className="rev-container">
      <div className="rev-header">
        <h1 className="rev-title">Recenzenci</h1>
        <div className="rev-title-underline"></div>
      </div>

      <p className="rev-intro">
        Strona prezentuje grono recenzentów współpracujących z czasopismem —
        uznanych specjalistów i ekspertów reprezentujących różne dziedziny
        nauki. Dzięki ich wiedzy, doświadczeniu oraz zaangażowaniu proces
        recenzyjny przebiega z zachowaniem najwyższych standardów rzetelności,
        obiektywizmu i jakości merytorycznej publikowanych prac.
      </p>

      <div className="rev-grid">
        {reviewers.map((reviewer) => (
          <div key={reviewer.id} className="rev-card">
            <div className="rev-avatar">
              <span className="rev-avatar-text">
                {getInitials(reviewer.name)}
              </span>
            </div>
            <div className="rev-info">
              <h2 className="rev-reviewer-name">{reviewer.name}</h2>
              <h3 className="rev-reviewer-field">{reviewer.field}</h3>
              <p className="rev-reviewer-desc">{reviewer.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviewers;
