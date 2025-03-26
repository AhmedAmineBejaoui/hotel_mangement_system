import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, HelpCircle, BookOpen, LifeBuoy, MessageSquare, FileText, PhoneCall, Mail } from "lucide-react";

export default function Help() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les FAQ en fonction de la recherche
  const faqItems = [
    {
      question: "Comment ajouter une nouvelle réservation ?",
      answer: "Pour ajouter une nouvelle réservation, accédez à la page 'Réservations' depuis le menu principal, puis cliquez sur le bouton 'Nouvelle réservation'. Remplissez tous les champs obligatoires du formulaire et cliquez sur 'Créer'."
    },
    {
      question: "Comment modifier l'état d'une chambre ?",
      answer: "Allez sur la page 'Chambres', trouvez la chambre que vous souhaitez modifier, cliquez sur le bouton 'Modifier' et changez son état dans le formulaire qui s'affiche. Les options disponibles sont: Libre, Occupée, En nettoyage, En maintenance, et Réservée."
    },
    {
      question: "Comment générer un rapport de revenus ?",
      answer: "Sur le tableau de bord principal, utilisez le sélecteur de période pour choisir la plage de dates souhaitée (Jour, Semaine, Mois, Année). Les graphiques s'actualiseront automatiquement pour afficher les données de cette période."
    },
    {
      question: "Comment enregistrer un nouveau paiement ?",
      answer: "Accédez à la page 'Paiements', cliquez sur 'Nouveau paiement', sélectionnez la réservation concernée, saisissez le montant et choisissez la méthode de paiement. Complétez les informations additionnelles si nécessaire."
    },
    {
      question: "Comment ajouter un nouveau membre du personnel ?",
      answer: "Dans la section 'Personnel', cliquez sur 'Ajouter un membre du personnel'. Remplissez le formulaire avec les informations nécessaires : nom, fonction, département, date d'embauche, etc."
    },
    {
      question: "Comment gérer les demandes spéciales des clients ?",
      answer: "Les demandes spéciales peuvent être ajoutées lors de la création d'une réservation ou en modifiant une réservation existante. Utilisez le champ 'Demandes spéciales' pour noter toutes les exigences particulières."
    },
    {
      question: "Comment se déconnecter du système ?",
      answer: "Cliquez sur votre profil en haut à droite de l'écran, puis sélectionnez 'Déconnexion' dans le menu déroulant."
    },
    {
      question: "Comment changer de thème (clair/sombre) ?",
      answer: "Allez dans 'Paramètres' en cliquant sur votre profil, puis naviguez jusqu'à l'onglet 'Apparence'. Vous pouvez y sélectionner le thème de votre choix : Clair, Sombre ou Système (suit les préférences de votre système)."
    }
  ];

  const filteredFAQs = searchQuery 
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  // Soumission du formulaire de contact
  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé",
      description: "Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.",
    });
    // Réinitialiser le formulaire
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Aide et support</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section de recherche */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Comment pouvons-nous vous aider ?</CardTitle>
            <CardDescription>
              Recherchez dans notre base de connaissances ou contactez notre support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher dans l'aide..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section principale */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs pour différentes sections d'aide */}
          <Tabs defaultValue="faq">
            <TabsList className="mb-4">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Guides d'utilisation
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Nous contacter
              </TabsTrigger>
            </TabsList>

            {/* Contenu FAQ */}
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Questions fréquentes</CardTitle>
                  <CardDescription>
                    Trouvez rapidement des réponses aux questions les plus courantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredFAQs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFAQs.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{item.question}</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Aucun résultat pour "{searchQuery}"</p>
                      <p className="mt-2">Essayez une autre recherche ou contactez notre support</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contenu Guides */}
            <TabsContent value="guides">
              <Card>
                <CardHeader>
                  <CardTitle>Guides d'utilisation</CardTitle>
                  <CardDescription>
                    Consultez nos guides détaillés pour maîtriser toutes les fonctionnalités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="overflow-hidden">
                      <div className="bg-primary/10 p-6 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">Guide de démarrage rapide</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Commencez à utiliser le système de gestion hôtelière en quelques minutes.
                        </p>
                        <Button className="w-full">Télécharger le PDF</Button>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="bg-primary/10 p-6 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">Guide des réservations</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Tout ce que vous devez savoir sur la gestion des réservations.
                        </p>
                        <Button className="w-full">Télécharger le PDF</Button>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="bg-primary/10 p-6 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">Guide de facturation</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Comment gérer efficacement les paiements et les factures.
                        </p>
                        <Button className="w-full">Télécharger le PDF</Button>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="bg-primary/10 p-6 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">Guide des rapports</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Comment générer et interpréter les rapports statistiques.
                        </p>
                        <Button className="w-full">Télécharger le PDF</Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contenu Contact */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contactez notre équipe</CardTitle>
                  <CardDescription>
                    Besoin d'aide? Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitContactForm} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Nom</label>
                        <Input id="name" placeholder="Votre nom" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input id="email" type="email" placeholder="votre@email.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Sujet</label>
                      <Input id="subject" placeholder="Sujet de votre message" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <Textarea
                        id="message"
                        placeholder="Comment pouvons-nous vous aider?"
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full md:w-auto">Envoyer le message</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle>Assistance directe</CardTitle>
              <CardDescription>
                Nous sommes disponibles pour vous aider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <PhoneCall className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Téléphone</h3>
                  <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
                  <p className="text-xs text-muted-foreground mt-1">Du lundi au vendredi, 9h-18h</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Email</h3>
                  <p className="text-sm text-muted-foreground">support@hotelsystem.com</p>
                  <p className="text-xs text-muted-foreground mt-1">Nous répondons sous 24h</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Chat en direct</h3>
                  <p className="text-sm text-muted-foreground">Disponible depuis votre compte</p>
                  <p className="text-xs text-muted-foreground mt-1">Temps d'attente moyen: 5min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ressources populaires */}
          <Card>
            <CardHeader>
              <CardTitle>Ressources populaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Guide des réservations</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Configuration des tarifs</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Gestion des disponibilités</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Procédures de check-in/check-out</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Rapports et statistiques</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}