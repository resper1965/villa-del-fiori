import Link from "next/link"
import { Building2 } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-[#00ade8] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-[#00ade8]">
                <Building2 className="h-8 w-8 text-white stroke-1" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-200">Termos de Serviço</h1>
            <p className="text-gray-400">Gabi - Síndica Virtual</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">1. Aceitação dos Termos</h2>
              <p className="text-gray-300 leading-relaxed">
                Ao acessar e usar o sistema Gabi - Síndica Virtual, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
                Se você não concorda com qualquer parte destes termos, não deve usar o sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">2. Uso do Sistema</h2>
              <p className="text-gray-300 leading-relaxed">
                O sistema é destinado exclusivamente para uso interno do Condomínio Villa Dei Fiori. 
                Você concorda em usar o sistema apenas para fins legais e de acordo com estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">3. Conta de Usuário</h2>
              <p className="text-gray-300 leading-relaxed">
                Para acessar o sistema, você precisa criar uma conta. Você é responsável por manter a confidencialidade 
                de suas credenciais de login. Todas as atividades que ocorrem sob sua conta são de sua responsabilidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">4. Aprovação de Usuários</h2>
              <p className="text-gray-300 leading-relaxed">
                Novos usuários precisam ser aprovados por um administrador antes de obter acesso completo ao sistema. 
                A aprovação está sujeita à verificação de identidade e vínculo com o condomínio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">5. Conduta do Usuário</h2>
              <p className="text-gray-300 leading-relaxed">
                Você concorda em não usar o sistema para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                <li>Violar qualquer lei ou regulamento</li>
                <li>Transmitir conteúdo ofensivo, difamatório ou ilegal</li>
                <li>Interferir no funcionamento do sistema</li>
                <li>Acessar áreas não autorizadas do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">6. Propriedade Intelectual</h2>
              <p className="text-gray-300 leading-relaxed">
                Todo o conteúdo do sistema, incluindo textos, gráficos, logos e software, é propriedade do Condomínio 
                Villa Dei Fiori e está protegido por leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-300 leading-relaxed">
                O sistema é fornecido "como está", sem garantias de qualquer tipo. O Condomínio não se responsabiliza 
                por danos diretos, indiretos ou consequenciais resultantes do uso do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">8. Modificações dos Termos</h2>
              <p className="text-gray-300 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
                imediatamente após a publicação. O uso continuado do sistema após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-3">9. Contato</h2>
              <p className="text-gray-300 leading-relaxed">
                Para questões sobre estes termos, entre em contato com a administração do condomínio.
              </p>
            </section>

            <div className="pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 text-center">
            <Link 
              href="/login" 
              className="text-[#00ade8] hover:underline text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
