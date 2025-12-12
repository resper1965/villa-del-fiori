import Link from "next/link"
import { Building2 } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary">
                <Building2 className="h-8 w-8 text-white stroke-1" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Termos de Serviço</h1>
            <p className="text-muted-foreground">Gabi - Síndica Virtual</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
              <p className="text-foreground leading-relaxed">
                Ao acessar e usar o sistema Gabi - Síndica Virtual, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
                Se você não concorda com qualquer parte destes termos, não deve usar o sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Uso do Sistema</h2>
              <p className="text-foreground leading-relaxed">
                O sistema é destinado exclusivamente para uso interno do Condomínio Villa Dei Fiori. 
                Você concorda em usar o sistema apenas para fins legais e de acordo com estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Conta de Usuário</h2>
              <p className="text-foreground leading-relaxed">
                Para acessar o sistema, você precisa criar uma conta. Você é responsável por manter a confidencialidade 
                de suas credenciais de login. Todas as atividades que ocorrem sob sua conta são de sua responsabilidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Aprovação de Usuários</h2>
              <p className="text-foreground leading-relaxed">
                Novos usuários precisam ser aprovados por um administrador antes de obter acesso completo ao sistema. 
                A aprovação está sujeita à verificação de identidade e vínculo com o condomínio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Conduta do Usuário</h2>
              <p className="text-foreground leading-relaxed">
                Você concorda em não usar o sistema para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground">
                <li>Violar qualquer lei ou regulamento</li>
                <li>Transmitir conteúdo ofensivo, difamatório ou ilegal</li>
                <li>Interferir no funcionamento do sistema</li>
                <li>Acessar áreas não autorizadas do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Propriedade Intelectual</h2>
              <p className="text-foreground leading-relaxed">
                Todo o conteúdo do sistema, incluindo textos, gráficos, logos e software, é propriedade do Condomínio 
                Villa Dei Fiori e está protegido por leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitação de Responsabilidade</h2>
              <p className="text-foreground leading-relaxed">
                O sistema é fornecido "como está", sem garantias de qualquer tipo. O Condomínio não se responsabiliza 
                por danos diretos, indiretos ou consequenciais resultantes do uso do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Modificações dos Termos</h2>
              <p className="text-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
                imediatamente após a publicação. O uso continuado do sistema após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Contato</h2>
              <p className="text-foreground leading-relaxed">
                Para questões sobre estes termos, entre em contato com a administração do condomínio.
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 text-center">
            <Link 
              href="/login" 
              className="text-primary hover:underline text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
