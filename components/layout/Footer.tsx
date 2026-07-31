import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <Container>
        <div className="py-10">
          <h2 className="text-xl font-bold">INCAL</h2>

          <p className="mt-3 max-w-md text-sm text-gray-600">
            Camas, colchones y soluciones para un mejor descanso.
          </p>

          <p className="mt-8 text-sm text-gray-500">
            © 2026 Incal. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}